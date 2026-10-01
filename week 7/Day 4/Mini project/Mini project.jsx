import React from 'react';
import { faBuilding, faEarthAmericas, faLandmark } from '@fortawesome/free-solid-svg-icons';
import Card from './Card.jsx';
import Contact from './Contact.jsx';
import Header from './Header.jsx';

const companyDescription =
	'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.';

function LandingPage() {
	return (
		<div className="company-page" id="top">
			<Header />
			<main className="company-content">
				<Card title="About the Company" icon={faBuilding}>
					{companyDescription}
				</Card>
				<Card title="Our Values" icon={faEarthAmericas} shaded>
					{companyDescription}
				</Card>
				<Card title="Our Mission" icon={faLandmark}>
					{companyDescription}
				</Card>
				<Contact />
			</main>
		</div>
	);
}

export default LandingPage;
