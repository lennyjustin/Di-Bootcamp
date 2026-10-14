const assignmentForm = document.querySelector("#assignment-form");
const titleInput = document.querySelector("#assignment-title");
const dueDateInput = document.querySelector("#due-date");
const assignmentList = document.querySelector("#assignment-list");
const emptyState = document.querySelector("#empty-state");
const assignmentCount = document.querySelector("#assignment-count");
const feedback = document.querySelector("#form-feedback");
const todayLabel = document.querySelector("#today-label");

const assignments = [];

todayLabel.textContent = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
}).format(new Date());

function formatDueDate(dateValue) {
  const [year, month, day] = dateValue.split("-").map(Number);
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(year, month - 1, day));
}

function getDueLabel(dateValue) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const dueDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const differenceInDays = Math.round((dueDate - today) / 86400000);

  if (differenceInDays < 0) return "Past due";
  if (differenceInDays === 0) return "Due today";
  if (differenceInDays === 1) return "Due tomorrow";
  return `In ${differenceInDays} days`;
}

function renderAssignments() {
  assignmentList.replaceChildren();
  emptyState.hidden = assignments.length > 0;
  assignmentCount.textContent = assignments.length;

  assignments.forEach((assignment) => {
    const item = document.createElement("li");
    item.className = "assignment-card";

    const marker = document.createElement("span");
    marker.className = "assignment-marker";
    marker.setAttribute("aria-hidden", "true");
    marker.textContent = "✓";

    const details = document.createElement("div");
    details.className = "assignment-details";

    const title = document.createElement("h3");
    title.className = "assignment-title";
    title.textContent = assignment.title;

    const dueDate = document.createElement("p");
    dueDate.className = "assignment-due";
    dueDate.textContent = `Due ${formatDueDate(assignment.dueDate)}`;

    const dueBadge = document.createElement("span");
    dueBadge.className = "due-badge";
    dueBadge.textContent = getDueLabel(assignment.dueDate);

    details.append(title, dueDate);
    item.append(marker, details, dueBadge);
    assignmentList.append(item);
  });
}

assignmentForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  if (!title) {
    titleInput.focus();
    return;
  }

  const assignment = {
    title,
    dueDate: dueDateInput.value,
  };
  assignments.unshift(assignment);
  renderAssignments();

  feedback.textContent = `“${assignment.title}” is on your list.`;
  assignmentForm.reset();
  titleInput.focus();
});