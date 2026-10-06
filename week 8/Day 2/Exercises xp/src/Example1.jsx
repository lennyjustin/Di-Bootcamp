import profileData from './data/data.json'

function Example1() {
  return (
    <section className="exercise-box">
      <h2>Example 1 - Social Medias</h2>
      <ul className="list-group">
        {profileData.socialMedias.map((item, index) => (
          <li className="list-group-item" key={`${item}-${index}`}>
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Example1
