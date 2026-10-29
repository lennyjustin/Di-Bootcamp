import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  deleteTask,
  editTask,
  toggleTaskProgress,
} from '../features/productivity/productivitySlice.js';
import {
  selectCategories,
  selectTasksByCategory,
} from '../features/productivity/productivitySelectors.js';

export default function TaskList({ categoryId }) {
  const dispatch = useDispatch();
  const tasks = useSelector((state) =>
    selectTasksByCategory(state, categoryId),
  );
  const categories = useSelector(selectCategories);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftCategoryId, setDraftCategoryId] = useState('');

  const handleEdit = useCallback((task) => {
    setEditingTaskId(task.id);
    setDraftTitle(task.title);
    setDraftCategoryId(task.categoryId);
  }, []);

  const handleSaveEdit = useCallback(
    (event, taskId) => {
      event.preventDefault();
      const title = draftTitle.trim();

      if (!title || !draftCategoryId) return;

      dispatch(editTask({ id: taskId, title, categoryId: draftCategoryId }));
      setEditingTaskId(null);
    },
    [dispatch, draftCategoryId, draftTitle],
  );

  const handleToggleCompletion = useCallback(
    (taskId) => dispatch(toggleTaskProgress(taskId)),
    [dispatch],
  );

  const handleDelete = useCallback(
    (taskId) => dispatch(deleteTask(taskId)),
    [dispatch],
  );

  if (tasks.length === 0) {
    return (
      <p className="empty-state" role="status">
        No tasks here yet. Add one to get started.
      </p>
    );
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => {
        const category = categories.find(
          (item) => item.id === task.categoryId,
        );

        return (
          <li className="task-row" key={task.id}>
            {editingTaskId === task.id ? (
              <form
                className="edit-task-form"
                onSubmit={(event) => handleSaveEdit(event, task.id)}
              >
                <input
                  aria-label="Task name"
                  autoFocus
                  onChange={(event) => setDraftTitle(event.target.value)}
                  value={draftTitle}
                />
                <select
                  aria-label="Task category"
                  onChange={(event) =>
                    setDraftCategoryId(event.target.value)
                  }
                  value={draftCategoryId}
                >
                  {categories.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
                <button className="text-button" type="submit">
                  Save
                </button>
                <button
                  className="text-button muted"
                  onClick={() => setEditingTaskId(null)}
                  type="button"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <button
                  aria-label={
                    task.completed
                      ? `Mark ${task.title} as incomplete`
                      : `Mark ${task.title} as complete`
                  }
                  aria-pressed={task.completed}
                  className={`completion-toggle${task.completed ? ' is-complete' : ''}`}
                  onClick={() => handleToggleCompletion(task.id)}
                  type="button"
                >
                  {task.completed ? '✓' : ''}
                </button>
                <div className="task-content">
                  <span
                    className={
                      task.completed ? 'task-title completed' : 'task-title'
                    }
                  >
                    {task.title}
                  </span>
                  {category && (
                    <span
                      className="task-category"
                      style={{ '--category-color': category.color }}
                    >
                      {category.name}
                    </span>
                  )}
                </div>
                <div className="task-actions">
                  <button
                    aria-label={`Edit ${task.title}`}
                    className="text-button"
                    onClick={() => handleEdit(task)}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    aria-label={`Delete ${task.title}`}
                    className="text-button danger"
                    onClick={() => handleDelete(task.id)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}
