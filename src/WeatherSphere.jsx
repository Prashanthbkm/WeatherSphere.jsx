import React, { useState, useEffect } from 'react';
import './WeatherSphere.css';

const WeatherSphere = () => {
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unit, setUnit] = useState('metric');

// Temporary fix for testing:
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || "5b6d080e82a6827824dd5641ab464d26";

  // Get current location on app start
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          await fetchWeatherByCoords(latitude, longitude);
        },
        (error) => {
          console.log("Location access denied");
        }
      );
    }
  }, []);

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    try {
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${API_KEY}`
      );
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${unit}&appid=${API_KEY}`
      );

      if (!currentResponse.ok || !forecastResponse.ok) throw new Error('Weather data unavailable');

      const currentData = await currentResponse.json();
      const forecastData = await forecastResponse.json();

      setWeather(currentData);
      setForecast(forecastData.list.slice(0, 5)); // Next 5 periods
      setError('');
    } catch (err) {
      setError('Unable to fetch weather data');
    }
    setLoading(false);
  };

  const fetchWeatherData = async (city) => {
    setLoading(true);
    try {
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=${API_KEY}`
      );
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${unit}&appid=${API_KEY}`
      );

      if (!currentResponse.ok || !forecastResponse.ok) throw new Error('City not found');

      const currentData = await currentResponse.json();
      const forecastData = await forecastResponse.json();

      setWeather(currentData);
      setForecast(forecastData.list.slice(0, 5));
      setError('');
    } catch (err) {
      setError('City not found. Please try again.');
      setWeather(null);
      setForecast([]);
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (location.trim()) {
      fetchWeatherData(location.trim());
      setLocation('');
    }
  };

  const toggleUnit = () => {
    setUnit(unit === 'metric' ? 'imperial' : 'metric');
    if (weather) {
      fetchWeatherData(weather.name);
    }
  };

  const getWeatherEmoji = (main) => {
    const emojiMap = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Drizzle': '🌦️',
      'Thunderstorm': '⛈️',
      'Snow': '❄️',
      'Mist': '🌫️',
      'Fog': '🌁'
    };
    return emojiMap[main] || '🌈';
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="weather-sphere">
      {/* Header Section */}
      <div className="sphere-header">
        <div className="header-content">
          <h1>🌍 WeatherSphere</h1>
          <p>Real-time Global Weather Intelligence</p>
        </div>
        <button className="unit-toggle" onClick={toggleUnit}>
          {unit === 'metric' ? '°C → °F' : '°F → °C'}
        </button>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <form onSubmit={handleSubmit} className="search-form">
          <div className="input-container">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter any city worldwide..."
              className="search-input"
            />
            <button type="submit" className="search-button">
              <span className="search-icon">🔍</span>
              Analyze
            </button>
          </div>
        </form>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="pulse-loader"></div>
          <p>Scanning atmospheric data...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
        </div>
      )}

      {/* Main Weather Display */}
      {weather && !loading && (
        <div className="weather-display">
          {/* Current Weather Card */}
          <div className="current-weather">
            <div className="location-info">
              <h2>{weather.name}, {weather.sys.country}</h2>
              <p className="update-time">Updated: {formatTime(weather.dt)}</p>
            </div>
            
            <div className="weather-main">
              <div className="temperature-section">
                <div className="current-temp">
                  {Math.round(weather.main.temp)}°{unit === 'metric' ? 'C' : 'F'}
                </div>
                <div className="weather-condition">
                  <span className="weather-emoji">
                    {getWeatherEmoji(weather.weather[0].main)}
                  </span>
                  <span className="weather-desc">
                    {weather.weather[0].description}
                  </span>
                </div>
              </div>

              <div className="weather-stats">
                <div className="stat-item">
                  <span className="stat-label">Feels Like</span>
                  <span className="stat-value">
                    {Math.round(weather.main.feels_like)}°
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Humidity</span>
                  <span className="stat-value">{weather.main.humidity}%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Wind Speed</span>
                  <span className="stat-value">{weather.wind.speed} m/s</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Pressure</span>
                  <span className="stat-value">{weather.main.pressure} hPa</span>
                </div>
              </div>
            </div>
          </div>

          {/* Forecast Section */}
          {forecast.length > 0 && (
            <div className="forecast-section">
              <h3>Upcoming Forecast</h3>
              <div className="forecast-cards">
                {forecast.map((item, index) => (
                  <div key={index} className="forecast-card">
                    <div className="forecast-time">
                      {formatTime(item.dt)}
                    </div>
                    <div className="forecast-emoji">
                      {getWeatherEmoji(item.weather[0].main)}
                    </div>
                    <div className="forecast-temp">
                      {Math.round(item.main.temp)}°
                    </div>
                    <div className="forecast-desc">
                      {item.weather[0].description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="additional-info">
            <div className="info-card">
              <h4>🌅 Sunrise & Sunset</h4>
              <p>Sunrise: {formatTime(weather.sys.sunrise)}</p>
              <p>Sunset: {formatTime(weather.sys.sunset)}</p>
            </div>
            <div className="info-card">
              <h4>👁️ Visibility</h4>
              <p>{(weather.visibility / 1000).toFixed(1)} km</p>
            </div>
            <div className="info-card">
              <h4>🌡️ Temperature Range</h4>
              <p>Min: {Math.round(weather.main.temp_min)}°</p>
              <p>Max: {Math.round(weather.main.temp_max)}°</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherSphere;