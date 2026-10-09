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
const topicSuggestions = document.getElementById('topic-suggestions');
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
const curriculumGroups = document.getElementById('curriculum-groups');
const curriculumResources = document.getElementById('curriculum-resources');
const learningHistoryList = document.getElementById('learning-history-list');
const historyStatus = document.getElementById('history-status');
const progressSaveStatus = document.getElementById('progress-save-status');

let currentLesson = null;
let currentQuestionIndex = 0;
let selectedAnswers = [];
let answeredQuestions = [];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

async function loadLearningHistory() {
  historyStatus.textContent = 'Loading your history...';
  try {
    const response = await fetch('/api/history');
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Unable to load your learning history.');
    }

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
    const response = await fetch(`/api/lessons/${lessonId}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Unable to open this lesson.');
    }
    subjectInput.value = data.subject;
    topicInput.value = data.topic;
    renderLesson(data);
  } catch (error) {
    historyStatus.textContent = error.message || 'Unable to open this lesson.';
  }
}

function renderCurriculumGuide(guide) {
  curriculumGroups.innerHTML = guide.groups.map((group) => `
    <article class="curriculum-card">
      <div class="curriculum-card-topline">
        <span class="curriculum-icon">${group.name.charAt(0)}</span>
        <h3>${group.name}</h3>
      </div>
      <p>${group.description}</p>
      <div class="subject-tags">
        ${group.subjects.map((subject) => `
          <button class="subject-tag" type="button" data-subject="${subject}">${subject}</button>
        `).join('')}
      </div>
    </article>
  `).join('');

  curriculumResources.innerHTML = guide.resources.map((resource) => `
    <a class="resource-link" href="${resource.url}" target="_blank" rel="noopener noreferrer">
      <span>${resource.name}</span>
      <small>${resource.source} ↗</small>
    </a>
  `).join('');

  document.querySelectorAll('.subject-tag').forEach((button) => {
    button.addEventListener('click', () => {
      subjectInput.value = button.dataset.subject;
      loadTopicSuggestions();
      topicInput.focus();
      topicInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });
}

function renderTopicSuggestions(subject, topics) {
  const safeTopics = Array.isArray(topics) && topics.length > 0 ? topics.slice(0, 6) : ['Explore a topic'];

  topicSuggestions.innerHTML = safeTopics.map((topic) => `
    <button class="topic-chip" type="button" data-topic="${topic}">${topic}</button>
  `).join('');

  topicSuggestions.querySelectorAll('.topic-chip').forEach((button) => {
    button.addEventListener('click', () => {
      topicInput.value = button.dataset.topic;
      topicInput.focus();
    });
  });

  if (safeTopics[0] && safeTopics[0] !== 'Explore a topic' && !topicInput.value.trim()) {
    topicInput.value = safeTopics[0];
  }
}

function loadTopicSuggestions() {
  fetch('/api/curriculum-topics')
    .then((response) => response.json())
    .then((data) => {
      const selectedSubject = subjectInput.value || 'History';
      const topics = data.subjects?.[selectedSubject] || [];
      renderTopicSuggestions(selectedSubject, topics);
    })
    .catch(() => {
      renderTopicSuggestions(subjectInput.value || 'History', [
        'Causes of the First World War',
        'Cell structure and functions',
        'Linear equations and inequalities',
      ]);
    });
}

function loadCurriculumGuide() {
  fetch('/api/curriculum')
    .then((response) => response.json())
    .then(renderCurriculumGuide)
    .catch(() => {
      curriculumGroups.innerHTML = '<p class="muted-text">The curriculum guide is temporarily unavailable.</p>';
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
  const keyPoints = data.key_points.map((item) => `<li>${item}</li>`).join('');
  return `
    <div>
      <p><strong>Subject:</strong> ${data.subject || 'History'}</p>
      <h3>Explanation</h3>
      <p>${data.explanation}</p>
    </div>
    <div>
      <h3>Key points</h3>
      <ul>${keyPoints}</ul>
    </div>
    <div>
      <h3>Example</h3>
      <p>${data.example}</p>
    </div>
    ${data.demo_label ? `<p><strong>${data.demo_label}:</strong> This lesson is ready to use without an AI connection.</p>` : ''}
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
  if (!question) {
    return;
  }

  const questionNumber = currentQuestionIndex + 1;
  questionCounter.textContent = `Question ${questionNumber} of ${currentLesson.questions.length}`;
  progressFill.style.width = `${((questionNumber) / currentLesson.questions.length) * 100}%`;
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
      if (answeredQuestions.includes(currentQuestionIndex)) {
        return;
      }

      answerQuestion(index, button);
    });

    answerOptions.appendChild(button);
  });
}

function answerQuestion(selectedIndex, selectedButton) {
  const currentQuestion = currentLesson.questions[currentQuestionIndex];
  const optionButtons = [...answerOptions.querySelectorAll('.option-btn')];

  optionButtons.forEach((button, index) => {
    if (index === currentQuestion.answer) {
      button.classList.add('correct');
    }

    if (index === selectedIndex && index !== currentQuestion.answer) {
      button.classList.add('incorrect');
    }

    if (index === selectedIndex) {
      button.classList.add('selected');
    }

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
    <div>${currentQuestion.explanation}</div>
    <div><strong>Correct answer:</strong> ${correctAnswerText}</div>
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
  const score = currentLesson.questions.reduce((total, question, index) => {
    return total + (selectedAnswers[index] === question.answer ? 1 : 0);
  }, 0);

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
    <div>Focus on the key points about ${currentLesson.title.toLowerCase()} and revisit the example before trying the topic again.</div>
  `;

  showScreen('results');
  saveQuizAttempt();
}

async function saveQuizAttempt() {
  progressSaveStatus.textContent = 'Saving your quiz result...';
  try {
    const response = await fetch('/api/quiz-attempts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lesson_id: currentLesson.lesson_id,
        selected_answers: selectedAnswers,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Unable to save your quiz result.');
    }
    progressSaveStatus.textContent = 'Quiz result saved.';
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

  fetch('/api/learn', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ subject, topic }),
  })
    .then(async (response) => {
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to prepare the lesson right now.');
      }

      const lessonData = {
        ...data,
        subject,
      };

      renderLesson(lessonData);
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
reviewLessonBtn.addEventListener('click', () => {
  showScreen('lesson');
});

showScreen('home');
loadCurriculumGuide();
loadTopicSuggestions();
loadLearningHistory();
subjectInput.addEventListener('change', loadTopicSuggestions);
