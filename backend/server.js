require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 8010;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'dev-refresh-secret';

const users = [];
const stories = [];
const contributors = [];

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const signToken = (userId, secret, expiresIn) =>
  jwt.sign({ userId }, secret, { expiresIn });

const getStoryPayload = (story) => {
  const storyContributors = contributors
    .filter((entry) => entry.story_id === story.id)
    .map((entry) => {
      const user = users.find((person) => person.id === entry.user_id);
      return user ? { id: entry.id, story_id: story.id, user_id: user.id, username: user.username } : null;
    })
    .filter(Boolean);

  const author = users.find((user) => user.id === story.author_id);

  return {
    ...story,
    author: author ? { id: author.id, username: author.username, email: author.email } : null,
    contributors: storyContributors,
  };
};

const getStoryById = (storyId) => stories.find((story) => story.id === Number(storyId));

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

const requireStoryAccess = (req, res, next) => {
  const story = getStoryById(req.params.id || req.params.story_id || req.body.story_id);

  if (!story) {
    return res.status(404).json({ message: 'Story not found.' });
  }

  const isAuthor = story.author_id === req.user.id;
  const isContributor = contributors.some(
    (entry) => entry.story_id === story.id && entry.user_id === req.user.id,
  );

  if (!isAuthor && !isContributor) {
    return res.status(403).json({ message: 'Not allowed to access this story.' });
  }

  req.story = story;
  next();
};

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Storytelling API is running.' });
});

app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body || {};

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existingUser = users.find((user) => user.email === normalizedEmail);

  if (existingUser) {
    return res.status(409).json({ message: 'A user with this email already exists.' });
  }

  try {
    const passwordHash = await bcrypt.hash(String(password), 10);
    const newUser = {
      id: users.length ? Math.max(...users.map((user) => user.id)) + 1 : 1,
      username: String(username).trim(),
      email: normalizedEmail,
      password_hash: passwordHash,
    };

    users.push(newUser);

    const accessToken = signToken(newUser.id, JWT_SECRET, '15m');
    const refreshToken = signToken(newUser.id, REFRESH_SECRET, '7d');

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return res.status(201).json({
      message: 'User registered successfully.',
      user: { id: newUser.id, username: newUser.username, email: newUser.email },
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to register user right now.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = users.find((entry) => entry.email === normalizedEmail);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  try {
    const match = await bcrypt.compare(String(password), user.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const accessToken = signToken(user.id, JWT_SECRET, '15m');
    const refreshToken = signToken(user.id, REFRESH_SECRET, '7d');

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return res.status(200).json({
      message: 'Login successful.',
      user: { id: user.id, username: user.username, email: user.email },
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to log in right now.' });
  }
});

app.post('/api/refresh', (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.headers?.cookie?.split('refreshToken=')[1]?.split(';')[0];

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token missing.' });
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const accessToken = signToken(decoded.userId, JWT_SECRET, '15m');
    return res.status(200).json({ accessToken });
  } catch (error) {
    return res.status(403).json({ message: 'Refresh token expired.' });
  }
});

app.get('/api/stories', requireAuth, (req, res) => {
  const allStories = stories.map(getStoryPayload);
  res.status(200).json(allStories);
});

app.post('/api/stories', requireAuth, (req, res) => {
  const { title, content } = req.body || {};

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required.' });
  }

  const newStory = {
    id: stories.length ? Math.max(...stories.map((story) => story.id)) + 1 : 1,
    title: String(title).trim(),
    content: String(content).trim(),
    author_id: req.user.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  stories.push(newStory);
  return res.status(201).json(getStoryPayload(newStory));
});

app.patch('/api/stories/:id', requireAuth, requireStoryAccess, (req, res) => {
  const { title, content } = req.body || {};
  const story = getStoryById(req.params.id);

  if (!story) {
    return res.status(404).json({ message: 'Story not found.' });
  }

  if (!title && !content) {
    return res.status(400).json({ message: 'Nothing to update.' });
  }

  if (title) story.title = String(title).trim();
  if (content) story.content = String(content).trim();
  story.updated_at = new Date().toISOString();

  return res.status(200).json(getStoryPayload(story));
});

app.delete('/api/stories/:id', requireAuth, (req, res) => {
  const story = getStoryById(req.params.id);

  if (!story) {
    return res.status(404).json({ message: 'Story not found.' });
  }

  if (story.author_id !== req.user.id) {
    return res.status(403).json({ message: 'Only the author can delete a story.' });
  }

  const storyIndex = stories.findIndex((entry) => entry.id === story.id);
  stories.splice(storyIndex, 1);
  contributors.splice(
    0,
    contributors.length,
    ...contributors.filter((entry) => entry.story_id !== story.id),
  );

  return res.status(200).json({ message: 'Story deleted successfully.' });
});

app.post('/api/contributors', requireAuth, (req, res) => {
  const { story_id, user_id } = req.body || {};

  if (!story_id || !user_id) {
    return res.status(400).json({ message: 'Story and user are required.' });
  }

  const story = getStoryById(story_id);
  if (!story) {
    return res.status(404).json({ message: 'Story not found.' });
  }

  const targetUser = users.find((user) => user.id === Number(user_id));
  if (!targetUser) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const isAuthor = story.author_id === req.user.id;
  if (!isAuthor) {
    return res.status(403).json({ message: 'Only the author can add contributors.' });
  }

  const alreadyExists = contributors.some(
    (entry) => entry.story_id === story.id && entry.user_id === targetUser.id,
  );

  if (alreadyExists) {
    return res.status(409).json({ message: 'User is already a contributor.' });
  }

  const contributorEntry = {
    id: contributors.length ? Math.max(...contributors.map((entry) => entry.id)) + 1 : 1,
    story_id: story.id,
    user_id: targetUser.id,
  };

  contributors.push(contributorEntry);
  return res.status(201).json({
    id: contributorEntry.id,
    story_id: story.id,
    user_id: targetUser.id,
    username: targetUser.username,
  });
});

app.get('/api/contributors/:story_id', requireAuth, (req, res) => {
  const story = getStoryById(req.params.story_id);
  if (!story) {
    return res.status(404).json({ message: 'Story not found.' });
  }

  const storyContributors = contributors
    .filter((entry) => entry.story_id === story.id)
    .map((entry) => {
      const user = users.find((person) => person.id === entry.user_id);
      return user ? { id: entry.id, story_id: story.id, user_id: user.id, username: user.username } : null;
    })
    .filter(Boolean);

  return res.status(200).json(storyContributors);
});

app.delete('/api/contributors/:id', requireAuth, (req, res) => {
  const contributor = contributors.find((entry) => entry.id === Number(req.params.id));

  if (!contributor) {
    return res.status(404).json({ message: 'Contributor not found.' });
  }

  const story = getStoryById(contributor.story_id);
  if (!story) {
    return res.status(404).json({ message: 'Story not found.' });
  }

  if (story.author_id !== req.user.id) {
    return res.status(403).json({ message: 'Only the story author can remove contributors.' });
  }

  const index = contributors.findIndex((entry) => entry.id === contributor.id);
  contributors.splice(index, 1);

  return res.status(200).json({ message: 'Contributor removed.' });
});

app.use((err, req, res, next) => {
  console.error(err);
  return res.status(500).json({ message: 'Something unexpected happened.' });
});

app.listen(PORT, () => {
  console.log(`Storytelling API listening on port ${PORT}`);
});
