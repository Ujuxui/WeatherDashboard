const apiKey = "a4a866586dad47bc890110009240712";
const searchButton = document.getElementById("searchButton");
const locationButton = document.getElementById("locationButton");
const cityInput = document.getElementById("cityInput");
const recentCitiesDropdown = document.getElementById("recentCitiesDropdown");
const weatherDisplay = document.getElementById("weatherDisplay");
const cityName = document.getElementById("cityName");
const currentDate = document.getElementById("currentDate");
const temperature = document.getElementById("temperature");
const windSpeed = document.getElementById("windSpeed");
const humidity = document.getElementById("humidity");
const weatherDescription = document.getElementById("weatherDescription");
const currentIcon = document.getElementById("currentIcon");
const forecast = document.getElementById("forecast");

// Updating Dropdown with the Recent Cities Section
function updateDropdown() {
  const recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];
  recentCitiesDropdown.innerHTML = recentCities.length
    ? recentCities.map(city => `<option value="${city}">${city}</option>`).join("")
    : '<option value="" disabled selected>No recent searches</option>';
}

// Saving City Names to the Local Storage
function addCityToLocalStorage(cityName) {
  let recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];
  if (!recentCities.includes(cityName)) {
    recentCities.push(cityName); // Limiting to 5 cities
    if (recentCities.length > 5) recentCities.shift(); 
    localStorage.setItem("recentCities", JSON.stringify(recentCities));
    updateDropdown();
  }
}

// Fetching the Weather Data
async function fetchWeatherData(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("City not found.");
  return response.json();
}

// Displaying the Weather Data
function displayCurrentWeather(data) {
  weatherDisplay.classList.remove("hidden");
  cityName.textContent = `${data.location.name}`;
  currentDate.textContent = new Date().toLocaleDateString();
  temperature.textContent = `Temperature: ${data.current.temp_c}°C`;
  windSpeed.textContent = `Wind: ${(data.current.wind_kph / 3.6).toFixed(2)} M/S`;
  humidity.textContent = `Humidity: ${data.current.humidity}%`;
  weatherDescription.textContent = data.current.condition.text;
  currentIcon.src = `https:${data.current.condition.icon}`;
}

function displayForecast(data) {
  forecast.innerHTML = "";
  data.forecast.forecastday.forEach(day => {
    const card = document.createElement("div");
    card.className = "p-4 bg-gray-200 rounded-lg text-center shadow-md";
    card.innerHTML = `
      <p>${day.date}</p>
      <img src="https:${day.day.condition.icon}" alt="Weather Icon" class="w-12 h-12 mx-auto my-2">
      <p>Temp: ${day.day.avgtemp_c}°C</p>
      <p>Wind: ${(day.day.maxwind_kph / 3.6).toFixed(2)} M/S</p>
      <p>Humidity: ${day.day.avghumidity}%</p>
    `;
    forecast.appendChild(card);
  });
}

// Adding the Event Listeners
searchButton.addEventListener("click", async () => {
  const city = cityInput.value.trim();
  if (!city) {
    alert("Please enter a valid city name.");
    return;
  }
  try {
    const currentUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`;
    const forecastUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=5&aqi=no`;
    const currentWeather = await fetchWeatherData(currentUrl);
    const forecastData = await fetchWeatherData(forecastUrl);
    displayCurrentWeather(currentWeather);
    displayForecast(forecastData);
    addCityToLocalStorage(city);
  } catch (error) {
    alert(error.message);
  }
});

locationButton.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(async position => {
    const { latitude, longitude } = position.coords;
    try {
      const currentUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${latitude},${longitude}&aqi=no`;
      const forecastUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${latitude},${longitude}&days=5&aqi=no`;
      const currentWeather = await fetchWeatherData(currentUrl);
      const forecastData = await fetchWeatherData(forecastUrl);
      displayCurrentWeather(currentWeather);
      displayForecast(forecastData);
    } catch (error) {
      alert(error.message);
    }
  });
});

recentCitiesDropdown.addEventListener("change", e => {
  const selectedCity = e.target.value;
  if (selectedCity) fetchWeatherData(selectedCity);
});

// Initializing the Recent Cities on Load
document.addEventListener("DOMContentLoaded", updateDropdown);
