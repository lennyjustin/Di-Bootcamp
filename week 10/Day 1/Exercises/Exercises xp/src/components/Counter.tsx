import { useState } from 'react'

type CounterAction = 'increment' | 'decrement'

export function Counter() {
  const [count, setCount] = useState<number>(0)
  const [lastAction, setLastAction] = useState<CounterAction | null>(null)

  function changeCount(action: CounterAction) {
    setCount((currentCount) =>
      action === 'increment' ? currentCount + 1 : currentCount - 1,
    )
    setLastAction(action)
  }

  return (
    <div className="counter">
      <output aria-live="polite" className="counter-value">
        {count}
      </output>
      <div aria-label="Counter controls" className="counter-controls">
        <button onClick={() => changeCount('decrement')} type="button">
          − <span className="visually-hidden">Decrement</span>
        </button>
        <button onClick={() => changeCount('increment')} type="button">
          + <span className="visually-hidden">Increment</span>
        </button>
      </div>
      <p aria-live="polite" className="supporting-text">
        {lastAction
          ? `Last action: ${lastAction === 'increment' ? 'incremented' : 'decremented'}`
          : 'No action yet'}
      </p>
    </div>
  )
}
