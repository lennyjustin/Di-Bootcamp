import { useSelector } from 'react-redux';
import { selectCategories } from '../features/productivity/productivitySelectors.js';

export default function CategorySelector({ value, onChange }) {
  const categories = useSelector(selectCategories);

  return (
    <label className="field-label" htmlFor="task-category-filter">
      Show tasks
      <select
        id="task-category-filter"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="all">All categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </label>
  );
}
