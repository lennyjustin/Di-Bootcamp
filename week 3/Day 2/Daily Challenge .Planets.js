const planets = [
    {
        name: "Mercury",
        color: "#9e9e9e",
        moons: 0
    },
    {
        name: "Venus",
        color: "#d4a373",
        moons: 0
    },
    {
        name: "Earth",
        color: "#2878c8",
        moons: 1
    },
    {
        name: "Mars",
        color: "#c1440e",
        moons: 2
    },
    {
        name: "Jupiter",
        color: "#d9a066",
        moons: 79
    },
    {
        name: "Saturn",
        color: "#e8c27a",
        moons: 82
    },
    {
        name: "Uranus",
        color: "#73c6c6",
        moons: 27
    },
    {
        name: "Neptune",
        color: "#4169e1",
        moons: 14
    }
];

const planetsSection = document.querySelector(".listPlanets");

planets.forEach((planet) => {
    // Create the planet div
    const planetDiv = document.createElement("div");

    // Add the required planet class
    planetDiv.classList.add("planet");

    // Add a class based on the planet name
    planetDiv.classList.add(planet.name.toLowerCase());

    // Display the planet name
    planetDiv.textContent = planet.name;

    // Give each planet a different color
    planetDiv.style.backgroundColor = planet.color;
    planetDiv.style.color = "white";

    // Create the moons for this planet
    for (let i = 0; i < planet.moons; i++) {
        const moonDiv = document.createElement("div");

        moonDiv.classList.add("moon");

        // Arrange moons around the planet
        const angle = (360 / planet.moons) * i;
        const radians = angle * Math.PI / 180;
        const radius = 75;

        const x = Math.cos(radians) * radius;
        const y = Math.sin(radians) * radius;

        moonDiv.style.left = `${62 + x - 20}px`;
        moonDiv.style.top = `${62 + y - 20}px`;

        // Helpful when hovering over a moon
        moonDiv.title = `${planet.name} moon ${i + 1}`;

        // Add the moon inside its planet
        planetDiv.appendChild(moonDiv);
    }

    // Add the completed planet to the section
    planetsSection.appendChild(planetDiv);
});