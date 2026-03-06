// ===== Configuration =====
const API_KEY = "abc20c836fb4b126a8658e9e361e20e9";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// ===== DOM Elements =====
const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const weatherCard = document.getElementById("weather-card");
const errorCard = document.getElementById("error-card");
const errorMessage = document.getElementById("error-message");
const loading = document.getElementById("loading");

const cityName = document.getElementById("city-name");
const dateTime = document.getElementById("date-time");
const tempValue = document.getElementById("temp-value");
const weatherDesc = document.getElementById("weather-desc");
const weatherIcon = document.getElementById("weather-icon");
const feelsLike = document.getElementById("feels-like");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("wind-speed");
const pressure = document.getElementById("pressure");

const chips = document.querySelectorAll(".chip");

// ===== Weather Icon Mapping =====
function getWeatherIcon(conditionId) {
    // https://openweathermap.org/weather-conditions
    if (conditionId >= 200 && conditionId < 300) {
        return { icon: "fa-solid fa-cloud-bolt", colorClass: "icon-storm" };
    } else if (conditionId >= 300 && conditionId < 400) {
        return { icon: "fa-solid fa-cloud-rain", colorClass: "icon-rain" };
    } else if (conditionId >= 500 && conditionId < 600) {
        return { icon: "fa-solid fa-cloud-showers-heavy", colorClass: "icon-rain" };
    } else if (conditionId >= 600 && conditionId < 700) {
        return { icon: "fa-solid fa-snowflake", colorClass: "icon-snow" };
    } else if (conditionId >= 700 && conditionId < 800) {
        return { icon: "fa-solid fa-smog", colorClass: "icon-mist" };
    } else if (conditionId === 800) {
        return { icon: "fa-solid fa-sun", colorClass: "" };
    } else if (conditionId === 801) {
        return { icon: "fa-solid fa-cloud-sun", colorClass: "" };
    } else if (conditionId > 801 && conditionId < 900) {
        return { icon: "fa-solid fa-cloud", colorClass: "icon-cloud" };
    }
    return { icon: "fa-solid fa-sun", colorClass: "" };
}

// ===== Format Date =====
function formatDateTime(timezoneOffset) {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const cityTime = new Date(utc + timezoneOffset * 1000);

    const options = {
        weekday: "long",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    };
    return cityTime.toLocaleString("en-US", options);
}

// ===== Show / Hide Helpers =====
function showLoading() {
    loading.classList.remove("hidden");
    weatherCard.classList.add("hidden");
    errorCard.classList.add("hidden");
}

function showError(msg) {
    loading.classList.add("hidden");
    weatherCard.classList.add("hidden");
    errorCard.classList.remove("hidden");
    errorMessage.textContent = msg;
}

function showWeather() {
    loading.classList.add("hidden");
    errorCard.classList.add("hidden");
    weatherCard.classList.remove("hidden");
    // Re-trigger animation
    weatherCard.style.animation = "none";
    weatherCard.offsetHeight; // force reflow
    weatherCard.style.animation = "";
}

// ===== Fetch Weather =====
async function fetchWeather(city) {
    if (!city.trim()) return;

    showLoading();

    try {
        const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) {
                showError(`City "${city}" not found. Please check the spelling and try again.`);
            } else if (response.status === 401) {
                showError("Invalid API key. Please check your configuration.");
            } else {
                showError("Something went wrong. Please try again later.");
            }
            return;
        }

        const data = await response.json();
        displayWeather(data);
    } catch (err) {
        showError("Network error. Please check your internet connection.");
    }
}

// ===== Display Weather Data =====
function displayWeather(data) {
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    dateTime.textContent = formatDateTime(data.timezone);
    tempValue.textContent = Math.round(data.main.temp);
    weatherDesc.textContent = data.weather[0].description;
    feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`;
    pressure.textContent = `${data.main.pressure} hPa`;

    // Set icon
    const { icon, colorClass } = getWeatherIcon(data.weather[0].id);
    weatherIcon.className = icon + (colorClass ? ` ${colorClass}` : "");

    showWeather();
}

// ===== Event Listeners =====
searchBtn.addEventListener("click", () => {
    fetchWeather(cityInput.value);
});

cityInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        fetchWeather(cityInput.value);
    }
});

chips.forEach((chip) => {
    chip.addEventListener("click", () => {
        const city = chip.getAttribute("data-city");
        cityInput.value = city;
        fetchWeather(city);
    });
});

// ===== Load Default City =====
fetchWeather("Nairobi");
