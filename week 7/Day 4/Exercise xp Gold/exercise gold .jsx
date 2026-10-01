import React from 'react';
import BootstrapCard from './BootstrapCard.jsx';

const celebrities = [
	{
		title: 'Bob Dylan',
		imageUrl: 'https://miro.medium.com/max/4800/1*_EDEWvWLREzlAvaQRfC_SQ.jpeg',
		buttonLabel: 'Go to Wikipedia',
		buttonUrl: 'https://en.wikipedia.org/wiki/Bob_Dylan',
		description:
			'Bob Dylan (born Robert Allen Zimmerman, May 24, 1941) is an American singer/songwriter, author, and artist who has been an influential figure in popular music and culture for more than five decades.',
	},
	{
		title: 'McCartney',
		imageUrl:
			'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Paul_McCartney_in_October_2018.jpg/240px-Paul_McCartney_in_October_2018.jpg',
		buttonLabel: 'Go to Wikipedia',
		buttonUrl: 'https://en.wikipedia.org/wiki/Paul_McCartney',
		description:
			'Sir James Paul McCartney CH MBE (born 18 June 1942) is an English singer, songwriter, musician, composer, and record and film producer who gained worldwide fame as co-lead vocalist and bassist for the Beatles.',
	},
];

const planets = ['Mars', 'Venus', 'Jupiter', 'Earth', 'Saturn', 'Neptune'];

function ExerciseGold() {
	return (
		<section className="exercise-card" aria-labelledby="gold-heading">
			<h2 id="gold-heading">Exercises XP Gold: Bootstrap</h2>

			<div className="d-flex flex-wrap justify-content-center">
				{celebrities.map((celebrity) => (
					<BootstrapCard key={celebrity.title} {...celebrity} />
				))}
			</div>

			<h3 className="mt-4">Planets</h3>
			<ul className="list-group">
				{planets.map((planet) => (
					<li className="list-group-item" key={planet}>
						{planet}
					</li>
				))}
			</ul>
		</section>
	);
}

export default ExerciseGold;
