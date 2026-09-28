const express = require('express');

const router = express.Router();
const posts = [];
let nextId = 1;

function getPostId(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        res.status(400).json({ error: 'Post ID must be a positive integer.' });
        return null;
    }
    return id;
}

function validatePostFields(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return { error: 'Request body must be a JSON object.' };
    }
    if (typeof body.title !== 'string' || !body.title.trim()) {
        return { error: 'title must be a non-empty string.' };
    }
    if (body.title.trim().length > 120) {
        return { error: 'title must be 120 characters or fewer.' };
    }
    if (typeof body.content !== 'string' || !body.content.trim()) {
        return { error: 'content must be a non-empty string.' };
    }
    return { title: body.title.trim(), content: body.content.trim() };
}

router.get('/', (_req, res) => {
    res.json(posts);
});

router.get('/:id', (req, res) => {
    const id = getPostId(req, res);
    if (id === null) return;

    const post = posts.find((item) => item.id === id);
    if (!post) return res.status(404).json({ error: 'Blog post not found.' });
    return res.json(post);
});

router.post('/', (req, res) => {
    const fields = validatePostFields(req.body);
    if (fields.error) return res.status(400).json({ error: fields.error });

    const post = {
        id: nextId++,
        title: fields.title,
        content: fields.content,
        timestamp: new Date().toISOString(),
    };
    posts.push(post);
    return res.status(201).location(`/posts/${post.id}`).json(post);
});

router.put('/:id', (req, res) => {
    const id = getPostId(req, res);
    if (id === null) return;

    const post = posts.find((item) => item.id === id);
    if (!post) return res.status(404).json({ error: 'Blog post not found.' });

    const fields = validatePostFields(req.body);
    if (fields.error) return res.status(400).json({ error: fields.error });

    post.title = fields.title;
    post.content = fields.content;
    return res.json(post);
});

router.delete('/:id', (req, res) => {
    const id = getPostId(req, res);
    if (id === null) return;

    const index = posts.findIndex((item) => item.id === id);
    if (index === -1) return res.status(404).json({ error: 'Blog post not found.' });

    posts.splice(index, 1);
    return res.status(204).end();
});

module.exports = router;
