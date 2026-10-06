import profileData from './data/data.json'

function Example2() {
  return (
    <section className="exercise-box">
      <h2>Example 2 - Skills</h2>
      <ul className="list-group">
        {profileData.skills.map((skill, index) => (
          <li className="list-group-item" key={`${skill}-${index}`}>
            {skill}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Example2
