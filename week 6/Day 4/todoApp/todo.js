export class TodoList {
  constructor() {
    this.tasks = [];
  }

  addTask(taskName) {
    this.tasks.push({ task: taskName, completed: false });
    console.log(`Added task: "${taskName}"`);
  }

  markComplete(taskName) {
    const task = this.tasks.find((t) => t.task === taskName);
    if (task) {
      task.completed = true;
      console.log(`Marked as complete: "${taskName}"`);
    } else {
      console.log(`Task "${taskName}" not found.`);
    }
  }

  listTasks() {
    console.log('\n--- Todo List ---');
    this.tasks.forEach((t, index) => {
      const status = t.completed ? '[✔] Completed' : '[ ] Pending';
      console.log(`${index + 1}. ${status} - ${t.task}`);
    });
  }
}
