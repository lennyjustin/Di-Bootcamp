import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addCategory,
  deleteCategory,
  editCategory,
} from '../features/productivity/productivitySlice.js';
import {
  selectCategories,
  selectTasksByCategory,
} from '../features/productivity/productivitySelectors.js';

export default function CategoryManager({ onCategoryDeleted }) {
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);
  const allTasks = useSelector((state) =>
    selectTasksByCategory(state, 'all'),
  );
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [draftName, setDraftName] = useState('');

  function handleAddCategory(event) {
    event.preventDefault();
    const name = newCategoryName.trim();

    if (!name) return;

    dispatch(addCategory(name));
    setNewCategoryName('');
  }

  function handleSaveCategory(event, categoryId) {
    event.preventDefault();
    const name = draftName.trim();

    if (!name) return;

    dispatch(editCategory({ id: categoryId, name }));
    setEditingCategoryId(null);
  }

  function handleDeleteCategory(categoryId) {
    dispatch(deleteCategory(categoryId));
    onCategoryDeleted(categoryId);
  }

  return (
    <section className="category-manager" aria-labelledby="categories-heading">
      <div className="section-heading">
        <div>
          <h2 id="categories-heading">Categories</h2>
          <p>Organize your tasks into focused areas.</p>
        </div>
      </div>

      <ul className="category-list">
        {categories.map((category) => {
          const taskCount = allTasks.filter(
            (task) => task.categoryId === category.id,
          ).length;

          return (
            <li className="category-row" key={category.id}>
              {editingCategoryId === category.id ? (
                <form
                  className="category-edit-form"
                  onSubmit={(event) =>
                    handleSaveCategory(event, category.id)
                  }
                >
                  <input
                    aria-label="Category name"
                    autoFocus
                    onChange={(event) => setDraftName(event.target.value)}
                    value={draftName}
                  />
                  <button className="text-button" type="submit">
                    Save
                  </button>
                  <button
                    className="text-button muted"
                    onClick={() => setEditingCategoryId(null)}
                    type="button"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  <span className="category-name">
                    <span
                      aria-hidden="true"
                      className="category-dot"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                    <span className="category-task-count">{taskCount}</span>
                  </span>
                  <div className="task-actions">
                    <button
                      aria-label={`Edit ${category.name} category`}
                      className="text-button"
                      onClick={() => {
                        setDraftName(category.name);
                        setEditingCategoryId(category.id);
                      }}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      aria-label={`Delete ${category.name} category and its tasks`}
                      className="text-button danger"
                      onClick={() => handleDeleteCategory(category.id)}
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

      <form className="add-category-form" onSubmit={handleAddCategory}>
        <label className="field-label" htmlFor="new-category-name">
          Add a category
          <input
            id="new-category-name"
            onChange={(event) => setNewCategoryName(event.target.value)}
            placeholder="e.g. Learning"
            required
            value={newCategoryName}
          />
        </label>
        <button className="secondary-button" type="submit">
          Add
        </button>
      </form>
      <p className="form-hint">
        Deleting a category also deletes all tasks in it.
      </p>
    </section>
  );
}
