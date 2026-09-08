const getLocationBtn = document.getElementById("getLocationBtn");
const latitudeSpan = document.getElementById("latitude");
const longitudeSpan = document.getElementById("longitude");

function showPosition(position) {
    latitudeSpan.textContent = position.coords.latitude;
    longitudeSpan.textContent = position.coords.longitude;
}

function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            latitudeSpan.textContent = "User denied the request for Geolocation.";
            longitudeSpan.textContent = "";
            break;
        case error.POSITION_UNAVAILABLE:
            latitudeSpan.textContent = "Location information is unavailable.";
            longitudeSpan.textContent = "";
            break;
        case error.TIMEOUT:
            latitudeSpan.textContent = "The request to get user location timed out.";
            longitudeSpan.textContent = "";
            break;
        case error.UNKNOWN_ERROR:
            latitudeSpan.textContent = "An unknown error occurred.";
            longitudeSpan.textContent = "";
            break;
    }
}

getLocationBtn.addEventListener("click", function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        latitudeSpan.textContent = "Geolocation is not supported by this browser.";
        longitudeSpan.textContent = "";
    }
});