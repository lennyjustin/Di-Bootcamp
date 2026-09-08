// Array of task objects (BONUS I)
const tasks = [];

const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const listTasks = document.querySelector('.listTasks');

// Add a new task
function addTask(text) {
  const taskId = tasks.length; // 0,1,2,...
  const newTask = {
    task_id: taskId,
    text: text,
    done: false
  };

  tasks.push(newTask);
  renderTask(newTask);
}

// Render a single task in the DOM
function renderTask(taskObj) {
  const taskEl = document.createElement('div');
  taskEl.classList.add('task-item');
  if (taskObj.done) taskEl.classList.add('done');
  taskEl.dataset.taskId = taskObj.task_id;

  // X button (Font Awesome)
  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('delete-btn');
  deleteBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
  deleteBtn.addEventListener('click', deleteTask);

  // Checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = taskObj.done;
  checkbox.addEventListener('change', doneTask);

  // Label
  const label = document.createElement('label');
  label.textContent = taskObj.text;

  taskEl.appendChild(deleteBtn);
  taskEl.appendChild(checkbox);
  taskEl.appendChild(label);

  listTasks.appendChild(taskEl);
}

// Handle form submit
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  addTask(text);
  taskInput.value = '';
  taskInput.focus();
});

// BONUS I: Mark task as done
function doneTask(e) {
  const taskEl = e.target.closest('.task-item');
  if (!taskEl) return;

  const taskId = Number(taskEl.dataset.taskId);
  const taskObj = tasks.find(t => t.task_id === taskId);
  if (!taskObj) return;

  taskObj.done = e.target.checked;

  if (taskObj.done) {
    taskEl.classList.add('done');
  } else {
    taskEl.classList.remove('done');
  }
}

// BONUS II: Delete task
function deleteTask(e) {
  const taskEl = e.target.closest('.task-item');
  if (!taskEl) return;

  const taskId = Number(taskEl.dataset.taskId);

  // Remove from array
  const index = tasks.findIndex(t => t.task_id === taskId);
  if (index !== -1) {
    tasks.splice(index, 1);
  }

  // Remove from DOM
  taskEl.remove();
}