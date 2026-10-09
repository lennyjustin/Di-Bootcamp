const screens = {
  home: document.getElementById('home-screen'),
  loading: document.getElementById('loading-screen'),
  lesson: document.getElementById('lesson-screen'),
  quiz: document.getElementById('quiz-screen'),
  results: document.getElementById('results-screen'),
};

const form = document.getElementById('learn-form');
const subjectInput = document.getElementById('subject');
const topicInput = document.getElementById('topic');
const formError = document.getElementById('form-error');
const startLearningBtn = document.getElementById('start-learning-btn');
const lessonSubject = document.getElementById('lesson-subject');
const lessonTitle = document.getElementById('lesson-title');
const lessonContent = document.getElementById('lesson-content');
const startQuizBtn = document.getElementById('start-quiz-btn');
const quizTitle = document.getElementById('quiz-title');
const questionCounter = document.getElementById('question-counter');
const progressFill = document.getElementById('progress-fill');
const quizQuestion = document.getElementById('quiz-question');
const answerOptions = document.getElementById('answer-options');
const quizFeedback = document.getElementById('quiz-feedback');
const nextQuestionBtn = document.getElementById('next-question-btn');
const scoreText = document.getElementById('score-text');
const percentageText = document.getElementById('percentage-text');
const feedbackMessage = document.getElementById('feedback-message');
const revisionBox = document.getElementById('revision-box');
const tryAnotherBtn = document.getElementById('try-another-btn');
const reviewLessonBtn = document.getElementById('review-lesson-btn');
const topicSuggestions = document.getElementById('topic-suggestions');
const learnScreen = document.getElementById('learn-screen');
const authScreen = document.getElementById('auth-screen');
const appShell = document.getElementById('app-shell');
const loginPanel = document.getElementById('login-panel');
const signupPanel = document.getElementById('signup-panel');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const switchAuthButton = document.getElementById('switch-auth');
const learnBackButton = document.getElementById('learn-back-btn');
const switchLoginCopy = document.getElementById('switch-login-copy');
const authMessage = document.getElementById('auth-message');
const logoutButton = document.getElementById('logout-btn');
const forgotPasswordButton = document.getElementById('forgot-password');
const googleLoginButton = document.getElementById('google-login');
const appleLoginButton = document.getElementById('apple-login');
const learningHistoryList = document.getElementById('learning-history-list');
const historyStatus = document.getElementById('history-status');
const progressSaveStatus = document.getElementById('progress-save-status');

let currentLesson = null;
let currentQuestionIndex = 0;
let selectedAnswers = [];
let answeredQuestions = [];
let authFlowOpen = false;

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status}).`);
  }
  return data;
}

async function loadLearningHistory() {
  if (!learningHistoryList || !historyStatus) return;
  historyStatus.textContent = 'Loading your history...';
  try {
    const data = await fetchJson('/api/history');
    const attemptsByLesson = new Map();
    data.quiz_attempts.forEach((attempt) => {
      const attempts = attemptsByLesson.get(attempt.lesson_id) || [];
      attempts.push(attempt);
      attemptsByLesson.set(attempt.lesson_id, attempts);
    });

    if (data.lessons.length === 0) {
      historyStatus.textContent = 'Your learning history will appear here.';
      learningHistoryList.innerHTML = '';
      return;
    }

    historyStatus.textContent = `${data.lessons.length} recent lesson${data.lessons.length === 1 ? '' : 's'}`;
    learningHistoryList.innerHTML = data.lessons.map((lesson) => {
      const attempts = attemptsByLesson.get(lesson.id) || [];
      const attemptMarkup = attempts.length
        ? `<ul class="history-attempts">${attempts.map((attempt) => `
            <li>Quiz: ${attempt.score} / ${attempt.total} · ${escapeHtml(attempt.completed_at)}</li>
          `).join('')}</ul>`
        : '<p>No quiz attempts yet.</p>';
      return `
        <article class="history-item">
          <div>
            <h3>${escapeHtml(lesson.title)}</h3>
            <p>${escapeHtml(lesson.subject)} · ${escapeHtml(lesson.topic)} · ${escapeHtml(lesson.created_at)}</p>
            ${attemptMarkup}
          </div>
          <button class="history-open-btn" type="button" data-lesson-id="${lesson.id}">Review lesson</button>
        </article>
      `;
    }).join('');
  } catch (error) {
    historyStatus.textContent = error.message || 'Unable to load your learning history.';
  }
}

async function openSavedLesson(lessonId) {
  try {
    const lesson = await fetchJson(`/api/lessons/${lessonId}`);
    subjectInput.value = lesson.subject;
    topicInput.value = lesson.topic;
    renderLesson(lesson);
  } catch (error) {
    historyStatus.textContent = error.message || 'Unable to open this lesson.';
  }
}

function setAuthenticated(isAuthenticated) {
  learnScreen.classList.toggle('hidden', isAuthenticated || authFlowOpen);
  authScreen.classList.toggle('hidden', isAuthenticated || !authFlowOpen);
  appShell.classList.toggle('hidden', !isAuthenticated);
  if (isAuthenticated) loadLearningHistory();
}

function showAuthMessage(message, isError = false) {
  authMessage.textContent = message;
  authMessage.classList.toggle('error', isError);
}

function setAuthMode(mode) {
  const showingLogin = mode === 'login';
  loginPanel.classList.toggle('hidden', !showingLogin);
  signupPanel.classList.toggle('hidden', showingLogin);
  switchLoginCopy.textContent = showingLogin ? 'Don’t have an account?' : 'Already have an account?';
  switchAuthButton.textContent = showingLogin ? 'Sign up' : 'Log in';
  showAuthMessage('');
}

function openAuth(mode) {
  authFlowOpen = true;
  setAuthMode(mode);
  setAuthenticated(false);
  const firstInput = document.getElementById(mode === 'signup' ? 'signup-name' : 'login-email');
  firstInput.focus();
}

function showLearnPage() {
  authFlowOpen = false;
  setAuthenticated(false);
}

function switchAuthMode() {
  const showingLogin = !loginPanel.classList.contains('hidden');
  setAuthMode(showingLogin ? 'signup' : 'login');
}

function authenticateDemo(email, remember = false) {
  const session = { email, signedInAt: new Date().toISOString() };
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem('somasmart-session', JSON.stringify(session));
  setAuthenticated(true);
}

function restoreSession() {
  const savedSession = localStorage.getItem('somasmart-session') || sessionStorage.getItem('somasmart-session');
  if (!savedSession) {
    setAuthenticated(false);
    return;
  }

  try {
    JSON.parse(savedSession);
    setAuthenticated(true);
  } catch {
    localStorage.removeItem('somasmart-session');
    sessionStorage.removeItem('somasmart-session');
    setAuthenticated(false);
  }
}

function renderTopicSuggestions(topics) {
  topicSuggestions.innerHTML = topics.map((topic) => `
    <button class="suggestion-btn" type="button">${escapeHtml(topic)}</button>
  `).join('');

  topicSuggestions.querySelectorAll('.suggestion-btn').forEach((button) => {
    button.addEventListener('click', () => {
      topicInput.value = button.textContent;
      topicInput.focus();
    });
  });
}

function loadCurriculumTopics() {
  fetchJson('/api/curriculum-topics')
    .then((catalog) => {
      const subjects = catalog.subjects || {};
      Object.keys(subjects).forEach((subject) => {
        if (![...subjectInput.options].some((option) => option.value === subject)) {
          subjectInput.add(new Option(subject, subject));
        }
      });

      const requestedSubject = new URLSearchParams(window.location.search).get('subject');
      const subjectAliases = { 'History and Government': 'History' };
      const selectedSubject = subjectAliases[requestedSubject] || requestedSubject;
      if (selectedSubject && Object.hasOwn(subjects, selectedSubject)) {
        subjectInput.value = selectedSubject;
      }

      const updateSuggestions = () => {
        const topics = subjects[subjectInput.value];
        renderTopicSuggestions(Array.isArray(topics) ? topics : []);
      };
      subjectInput.addEventListener('change', updateSuggestions);
      updateSuggestions();
    })
    .catch(() => {
      topicSuggestions.innerHTML = '<span class="muted-text">Enter any topic from your school notes.</span>';
    });
}

function showScreen(screenName) {
  Object.entries(screens).forEach(([name, screen]) => {
    screen.classList.toggle('active', name === screenName);
    screen.classList.toggle('hidden', name !== screenName);
  });
}

function setFormError(message) {
  formError.textContent = message;
}

function clearFormError() {
  formError.textContent = '';
}

function createLessonMarkup(data) {
  const keyPoints = data.key_points.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const curriculumNotes = data.curriculum_notes
    ? `<div><h3>${escapeHtml(data.curriculum_strand)} notes</h3><ul>${data.curriculum_notes.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>`
    : '';
  const keyTerms = data.key_terms
    ? `<div><h3>Key terms</h3><p>${data.key_terms.map(escapeHtml).join(' · ')}</p></div>`
    : '';
  const revisionTasks = data.revision_tasks
    ? `<div><h3>Revision tasks</h3><ol>${data.revision_tasks.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ol></div>`
    : '';
  const workedAnswers = data.worked_answers
    ? `<details class="worked-answers"><summary>Show worked answers</summary>${data.worked_answers.map((steps, index) => `<div><strong>Task ${index + 1}</strong><ol>${steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol></div>`).join('')}</details>`
    : '';
  const curriculumSourceNote = data.curriculum_source_note
    ? `<p class="curriculum-source-note">${escapeHtml(data.curriculum_source_note)}</p>`
    : '';
  return `
    <div>
      <p><strong>Subject:</strong> ${escapeHtml(data.subject || 'History')}</p>
      <h3>Explanation</h3>
      <p>${escapeHtml(data.explanation)}</p>
    </div>
    <div>
      <h3>Key points</h3>
      <ul>${keyPoints}</ul>
    </div>
    <div>
      <h3>Example</h3>
      <p>${escapeHtml(data.example)}</p>
    </div>
    ${curriculumNotes}
    ${keyTerms}
    ${revisionTasks}
    ${workedAnswers}
    ${curriculumSourceNote}
    ${data.demo_label ? `<p><strong>${escapeHtml(data.demo_label)}:</strong> This lesson is ready to use without an AI connection.</p>` : ''}
  `;
}

function renderLesson(data) {
  const subject = data.subject || subjectInput.value;
  currentLesson = data;
  lessonSubject.textContent = subject;
  lessonTitle.textContent = data.title;
  lessonContent.innerHTML = createLessonMarkup(data);
  showScreen('lesson');
  loadLearningHistory();
}

function resetQuizState() {
  currentQuestionIndex = 0;
  selectedAnswers = [];
  answeredQuestions = [];
  nextQuestionBtn.disabled = true;
  quizFeedback.classList.add('hidden');
  quizFeedback.classList.remove('correct', 'incorrect');
  answerOptions.innerHTML = '';
}

function renderQuestion() {
  const question = currentLesson.questions[currentQuestionIndex];
  if (!question) return;

  const questionNumber = currentQuestionIndex + 1;
  questionCounter.textContent = `Question ${questionNumber} of ${currentLesson.questions.length}`;
  progressFill.style.width = `${(questionNumber / currentLesson.questions.length) * 100}%`;
  quizTitle.textContent = `${currentLesson.title} Quiz`;
  quizQuestion.textContent = question.question;
  answerOptions.innerHTML = '';
  quizFeedback.classList.add('hidden');
  quizFeedback.classList.remove('correct', 'incorrect');
  nextQuestionBtn.disabled = true;

  question.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'option-btn';
    button.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
    button.disabled = answeredQuestions.includes(currentQuestionIndex);

    button.addEventListener('click', () => {
      if (answeredQuestions.includes(currentQuestionIndex)) return;
      answerQuestion(index, button);
    });

    answerOptions.appendChild(button);
  });
}

function answerQuestion(selectedIndex) {
  const currentQuestion = currentLesson.questions[currentQuestionIndex];
  const optionButtons = [...answerOptions.querySelectorAll('.option-btn')];

  optionButtons.forEach((button, index) => {
    if (index === currentQuestion.answer) button.classList.add('correct');
    if (index === selectedIndex && index !== currentQuestion.answer) button.classList.add('incorrect');
    if (index === selectedIndex) button.classList.add('selected');
    button.disabled = true;
  });

  selectedAnswers[currentQuestionIndex] = selectedIndex;
  answeredQuestions.push(currentQuestionIndex);

  const isCorrect = selectedIndex === currentQuestion.answer;
  quizFeedback.classList.remove('hidden');
  quizFeedback.classList.add(isCorrect ? 'correct' : 'incorrect');

  const correctAnswerText = currentQuestion.options[currentQuestion.answer];
  quizFeedback.innerHTML = `
    <strong>${isCorrect ? 'Correct!' : 'Not quite.'}</strong>
    <div>${escapeHtml(currentQuestion.explanation)}</div>
    <div><strong>Correct answer:</strong> ${escapeHtml(correctAnswerText)}</div>
  `;

  nextQuestionBtn.disabled = false;
}

function goToNextQuestion() {
  if (currentQuestionIndex < currentLesson.questions.length - 1) {
    currentQuestionIndex += 1;
    renderQuestion();
    return;
  }
  showResults();
}

function showResults() {
  const totalQuestions = currentLesson.questions.length;
  const score = currentLesson.questions.reduce((total, question, index) => total + (selectedAnswers[index] === question.answer ? 1 : 0), 0);
  const percentage = Math.round((score / totalQuestions) * 100);

  scoreText.textContent = `${score} / ${totalQuestions}`;
  percentageText.textContent = `${percentage}%`;

  let feedback = 'Nice work! You are building strong understanding.';
  if (score === 0) {
    feedback = 'A quick revision round will help this topic stick. Try reviewing the key points again.';
  } else if (score <= 2) {
    feedback = 'Good effort. Review the lesson summary and try another round to strengthen your understanding.';
  } else if (score <= 4) {
    feedback = 'Great job! You understand most of the topic and just need a little extra revision.';
  }

  feedbackMessage.textContent = feedback;
  revisionBox.innerHTML = `
    <strong>Revision suggestion:</strong>
    <div>Focus on the key points about ${escapeHtml(currentLesson.title.toLowerCase())} and revisit the example before trying the topic again.</div>
  `;

  showScreen('results');
  saveQuizAttempt();
}

async function saveQuizAttempt() {
  progressSaveStatus.textContent = 'Saving your quiz result...';
  try {
    await fetchJson('/api/quiz-attempts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lesson_id: currentLesson.lesson_id,
        selected_answers: selectedAnswers,
      }),
    });
    await loadLearningHistory();
    progressSaveStatus.textContent = 'Quiz result saved.';
  } catch (error) {
    progressSaveStatus.textContent = error.message || 'Unable to save your quiz result.';
  }
}

function handleLearn(event) {
  event.preventDefault();
  clearFormError();

  const subject = subjectInput.value.trim();
  const topic = topicInput.value.trim();

  if (!subject || !topic) {
    setFormError('Please select a subject and enter a topic.');
    return;
  }

  if (topic.length > 200) {
    setFormError('Topic must be 200 characters or fewer.');
    return;
  }

  startLearningBtn.disabled = true;
  showScreen('loading');

  fetchJson('/api/learn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject, topic }),
  })
    .then((data) => {
      renderLesson({ ...data, subject });
    })
    .catch((error) => {
      setFormError(error.message || 'Something went wrong. Please try again.');
      showScreen('home');
    })
    .finally(() => {
      startLearningBtn.disabled = false;
    });
}

function startQuiz() {
  resetQuizState();
  renderQuestion();
  showScreen('quiz');
}

form.addEventListener('submit', handleLearn);
learningHistoryList.addEventListener('click', (event) => {
  const button = event.target.closest('[data-lesson-id]');
  if (button) {
    openSavedLesson(Number(button.dataset.lessonId));
  }
});
startQuizBtn.addEventListener('click', startQuiz);
nextQuestionBtn.addEventListener('click', goToNextQuestion);
tryAnotherBtn.addEventListener('click', () => {
  showScreen('home');
  topicInput.focus();
});
reviewLessonBtn.addEventListener('click', () => showScreen('lesson'));

showScreen('home');
loadCurriculumTopics();

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  if (!email || password.length < 6) {
    showAuthMessage('Enter a valid email and a password of at least 6 characters.', true);
    return;
  }
  authenticateDemo(email, document.getElementById('remember-me').checked);
});

signupForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirmation = document.getElementById('signup-confirm').value;
  if (password !== confirmation) {
    showAuthMessage('Passwords do not match.', true);
    return;
  }
  authenticateDemo(email, true);
});

switchAuthButton.addEventListener('click', switchAuthMode);
learnBackButton.addEventListener('click', showLearnPage);
document.querySelectorAll('[data-auth-mode]').forEach((button) => {
  button.addEventListener('click', () => openAuth(button.dataset.authMode));
});
forgotPasswordButton.addEventListener('click', () => showAuthMessage('Password reset is available in the full account service.', false));
googleLoginButton.addEventListener('click', () => authenticateDemo('google-user@somasmart.demo', false));
appleLoginButton.addEventListener('click', () => authenticateDemo('apple-user@somasmart.demo', false));
logoutButton.addEventListener('click', () => {
  localStorage.removeItem('somasmart-session');
  sessionStorage.removeItem('somasmart-session');
  openAuth('login');
  showAuthMessage('You have been logged out.');
});
restoreSession();
