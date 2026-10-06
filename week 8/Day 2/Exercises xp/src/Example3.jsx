import profileData from './data/data.json'

function Example3() {
  return (
    <section className="exercise-box">
      <h2>Example 3 - Experiences</h2>
      <div className="experience-stack">
        {profileData.experiences.map((experience, index) => (
          <div className="experience-card" key={`${experience.company}-${index}`}>
            <h3>{experience.role}</h3>
            <p>
              <strong>{experience.company}</strong>
            </p>
            <p>{experience.location}</p>
            <p>{experience.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Example3
