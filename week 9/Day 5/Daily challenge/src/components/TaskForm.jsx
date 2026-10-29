import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addTask } from '../features/productivity/productivitySlice.js';
import { selectCategories } from '../features/productivity/productivitySelectors.js';

export default function TaskForm() {
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');

  useEffect(() => {
    if (
      categories.length > 0 &&
      !categories.some((category) => category.id === categoryId)
    ) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  function handleSubmit(event) {
    event.preventDefault();
    const cleanTitle = title.trim();

    if (!cleanTitle || !categoryId) return;

    dispatch(addTask({ title: cleanTitle, categoryId }));
    setTitle('');
  }

  if (categories.length === 0) {
    return (
      <p className="form-hint">
        Create a category before adding a task.
      </p>
    );
  }

  return (
    <form className="add-task-form" onSubmit={handleSubmit}>
      <label className="field-label task-name-field" htmlFor="new-task-title">
        New task
        <input
          id="new-task-title"
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What needs to get done?"
          required
          value={title}
        />
      </label>
      <label className="field-label" htmlFor="new-task-category">
        Category
        <select
          id="new-task-category"
          onChange={(event) => setCategoryId(event.target.value)}
          value={categoryId}
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <button className="primary-button" type="submit">
        Add task
      </button>
    </form>
  );
}
