import type { Key, ReactNode } from 'react'

interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => ReactNode
  getKey: (item: T) => Key
  emptyMessage?: string
}

export function List<T>({
  items,
  renderItem,
  getKey,
  emptyMessage = 'Nothing here yet.',
}: ListProps<T>) {
  if (items.length === 0) {
    return <p className="empty-state">{emptyMessage}</p>
  }

  return (
    <ul className="book-list">
      {items.map((item) => (
        <li className="book-list-item" key={getKey(item)}>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  )
}
