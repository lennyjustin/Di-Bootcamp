import { useState } from 'react';
import { useSelector } from 'react-redux';
import CategoryManager from './components/CategoryManager.jsx';
import CategorySelector from './components/CategorySelector.jsx';
import TaskForm from './components/TaskForm.jsx';
import TaskList from './components/TaskList.jsx';
import {
  selectAllTasks,
  selectCompletedTasks,
} from './features/productivity/productivitySelectors.js';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const allTasks = useSelector(selectAllTasks);
  const completedTasks = useSelector(selectCompletedTasks);
  const completionPercentage =
    allTasks.length === 0
      ? 0
      : Math.round((completedTasks / allTasks.length) * 100);

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <span className="eyebrow">YOUR DAILY RESET</span>
          <h1>Make room for what matters.</h1>
          <p>A little progress, one task at a time.</p>
        </div>
        <div className="date-stamp">
          <span>PRODUCTIVITY TRACKER</span>
          <strong>Today</strong>
        </div>
      </header>

      <section className="progress-card" aria-label="Daily progress">
        <div className="progress-copy">
          <div>
            <span className="progress-label">TODAY'S PROGRESS</span>
            <p>
              <strong>{completedTasks}</strong> of {allTasks.length} tasks
              completed
            </p>
          </div>
          <strong className="progress-percentage">{completionPercentage}%</strong>
        </div>
        <div
          aria-label={`${completionPercentage}% of tasks completed`}
          aria-valuemax="100"
          aria-valuemin="0"
          aria-valuenow={completionPercentage}
          className="progress-track"
          role="progressbar"
        >
          <span style={{ width: `${completionPercentage}%` }} />
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="tasks-panel" aria-labelledby="tasks-heading">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">YOUR CHECKLIST</span>
              <h2 id="tasks-heading">Tasks</h2>
            </div>
            <CategorySelector
              onChange={setSelectedCategory}
              value={selectedCategory}
            />
          </div>

          <TaskForm />
          <TaskList categoryId={selectedCategory} />
        </section>

        <CategoryManager
          onCategoryDeleted={(deletedId) => {
            if (selectedCategory === deletedId) {
              setSelectedCategory('all');
            }
          }}
        />
      </div>

      <footer className="page-footer">
        Built for steady progress, not perfect days.
      </footer>
    </main>
  );
}
