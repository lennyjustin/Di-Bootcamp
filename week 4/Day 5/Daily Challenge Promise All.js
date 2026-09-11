const form = document.querySelector("#sunrise-form");
const statusMessage = document.querySelector("#status");
const results = document.querySelector("#results");

async function fetchSunrise(latitude, longitude) {
    const params = new URLSearchParams({
        lat: latitude,
        lng: longitude,
    });
    const response = await fetch(`https://api.sunrise-sunset.org/v2?${params}`);

    if (!response.ok) {
        throw new Error(`Sunrise request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (!data.sunrise) {
        throw new Error(data.message || "Sunrise data was not returned");
    }

    return data.sunrise;
}

function displaySunrise(city, sunrise) {
    const card = document.createElement("article");
    card.className = "result-card";

    const heading = document.createElement("h2");
    heading.textContent = city;

    const time = document.createElement("p");
    time.textContent = `Sunrise: ${new Date(sunrise).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    })}`;

    card.append(heading, time);
    results.appendChild(card);
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    statusMessage.textContent = "Loading both sunrise times...";
    statusMessage.className = "";
    results.replaceChildren();

    const cities = [
        {
            name: document.querySelector("#city-one-name").value.trim(),
            latitude: document.querySelector("#city-one-lat").value,
            longitude: document.querySelector("#city-one-lng").value,
        },
        {
            name: document.querySelector("#city-two-name").value.trim(),
            latitude: document.querySelector("#city-two-lat").value,
            longitude: document.querySelector("#city-two-lng").value,
        },
    ];

    try {
        const sunriseTimes = await Promise.all(
            cities.map((city) => fetchSunrise(city.latitude, city.longitude)),
        );

        cities.forEach((city, index) => {
            displaySunrise(city.name, sunriseTimes[index]);
        });
        statusMessage.textContent = "Both sunrise times loaded.";
    } catch (error) {
        statusMessage.textContent = `Unable to load sunrise times: ${error.message}`;
        statusMessage.className = "error";
        console.error(error);
    }
});
