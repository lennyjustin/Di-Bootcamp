import { useEffect, useState } from 'react'

interface User {
  id: number
  name: string
  email: string
  phone: string
  company: {
    name: string
  }
}

export function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadUsers() {
      try {
        const response = await fetch(
          'https://jsonplaceholder.typicode.com/users',
          { signal: controller.signal },
        )

        if (!response.ok) {
          throw new Error(`The user request failed (${response.status}).`)
        }

        const fetchedUsers: User[] = await response.json()
        setUsers(fetchedUsers)
      } catch (caught: unknown) {
        if (!controller.signal.aborted) {
          setError(
            caught instanceof Error
              ? caught.message
              : 'An unexpected error occurred while loading users.',
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void loadUsers()
    return () => controller.abort()
  }, [])

  if (isLoading) {
    return (
      <p aria-live="polite" className="request-status">
        Loading people…
      </p>
    )
  }

  if (error) {
    return (
      <p className="request-status error-message" role="alert">
        Couldn’t load the directory: {error}
      </p>
    )
  }

  if (users.length === 0) {
    return <p className="request-status">No people were found.</p>
  }

  return (
    <ul className="user-list">
      {users.map((user) => (
        <li className="directory-user" key={user.id}>
          <div aria-hidden="true" className="avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="directory-user-details">
            <h3>{user.name}</h3>
            <p>{user.company.name}</p>
            <a href={`mailto:${user.email}`}>{user.email}</a>
            <p>{user.phone}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
