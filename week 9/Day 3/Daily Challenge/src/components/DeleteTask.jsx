import { useDispatch } from 'react-redux';
import { deleteTask } from '../features/planner/plannerSlice.js';

export default function DeleteTask({ date, task }) {
  const dispatch = useDispatch();

  return (
    <button
      className="icon-button task-action delete-action"
      type="button"
      aria-label={`Delete ${task.title}`}
      onClick={() => dispatch(deleteTask({ date, id: task.id }))}
    >
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M4.5 6h11m-9.7 0 .6 9.2c.1.8.7 1.3 1.5 1.3h4.2c.8 0 1.4-.5 1.5-1.3l.6-9.2M8 6V4.5h4V6m-3.5 3v4m3-4v4"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
