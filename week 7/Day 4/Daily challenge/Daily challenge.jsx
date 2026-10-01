import React from 'react';
import { Carousel } from 'react-responsive-carousel';

const destinations = [
	{
		name: 'Hong Kong',
		image: 'https://res.klook.com/image/upload/fl_lossy.progressive,q_65/c_fill,w_480,h_384/cities/jrfyzvgzvhs1iylduuhj.jpg',
	},
	{
		name: 'Macao',
		image: 'https://res.klook.com/image/upload/fl_lossy.progressive,q_65/c_fill,w_480,h_384/cities/c1cklkyp6ms02tougufx.webp',
	},
	{
		name: 'Japan',
		image: 'https://res.klook.com/image/upload/fl_lossy.progressive,q_65/c_fill,w_480,h_384/cities/e8fnw35p6zgusq218foj.webp',
	},
	{
		name: 'Las Vegas',
		image: 'https://res.klook.com/image/upload/fl_lossy.progressive,q_65/c_fill,w_480,h_384/cities/liw377az16sxmp9a6ylg.webp',
	},
];

function App() {
	return (
		<main className="carousel-page">
			<h1 className="visually-hidden">Explore destinations</h1>
			<Carousel
				ariaLabel="Travel destinations"
				showArrows={false}
				showStatus
				showIndicators
				showThumbs
				thumbWidth={70}
				infiniteLoop
				useKeyboardArrows
				swipeable
				emulateTouch
			>
				{destinations.map(({ name, image }) => (
					<div className="destination-slide" key={name}>
						<img src={image} alt={name} />
						<p className="legend">{name}</p>
					</div>
				))}
			</Carousel>
		</main>
	);
}

export default App;
