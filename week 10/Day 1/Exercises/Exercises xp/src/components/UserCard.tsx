interface UserCardProps {
  name?: string
  age?: number
  role?: string
}

export function UserCard({
  name = 'Guest',
  age,
  role = 'Visitor',
}: UserCardProps) {
  return (
    <article className="profile-card">
      <div aria-hidden="true" className="avatar">
        {name.charAt(0).toUpperCase()}
      </div>
      <div>
        <h3>{name}</h3>
        <p className="supporting-text">{role}</p>
      </div>
      <p className="profile-age">
        <span className="visually-hidden">Age: </span>
        {age === undefined ? 'Age not provided' : `${age} years old`}
      </p>
    </article>
  )
}
