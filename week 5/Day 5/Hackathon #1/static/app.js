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

let currentLesson = null;
let currentQuestionIndex = 0;
let selectedAnswers = [];
let answeredQuestions = [];

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
