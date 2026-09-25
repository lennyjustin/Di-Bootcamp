import { TodoList } from './todo.js';

const myTodoList = new TodoList();

myTodoList.addTask('Buy groceries');
myTodoList.addTask('Complete Node.js exercise');
myTodoList.addTask('Read a book');

myTodoList.markComplete('Complete Node.js exercise');
myTodoList.listTasks();
