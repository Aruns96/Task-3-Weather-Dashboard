import React, { useState } from "react";
import axios from "axios";

const Weather = () => {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(false);
  const [forecastData, setForecastData] = useState(null);
  const [isCelsius, setIsCelsius] = useState(true);

  const handleInputChange = (e) => {
    setCity(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //console.log("key",import.meta.env.VITE_WEB_API)

    try {
      const apiKey = import.meta.env.VITE_WEB_API;
      
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

      const url1 = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

      const response = await axios.get(url);

      const response1 = await axios.get(url1);

      setWeatherData(response.data);
      setForecastData(processData(response1.data.list));
      setError(false);
    } catch (error) {
      setError(true);
      console.error("Error fetching weather data:", error);
    }
  };

  const toggleUnits = () => {
    setIsCelsius(!isCelsius);
  };

  const getTemperature = (temp) => {
    if (isCelsius) {
      return `${temp}°C`;
    } else {
      return `${(temp * 9) / 5 + 32}°F`;
    }
  };

  const processData = (data) => {
    const dailyData = data.reduce((acc, item) => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!acc[date]) {
        acc[date] = {
          temps: [],
          descriptions: [],
          icons: []
        };
      }
      acc[date].temps.push(item.main.temp);
      acc[date].descriptions.push(item.weather[0].description);
      acc[date].icons.push(item.weather[0].icon);
      return acc;
    }, {});

    return Object.keys(dailyData).slice(0, 5).map(date => ({
      date,
      avgTemp: (dailyData[date].temps.reduce((sum, temp) => sum + temp, 0) / dailyData[date].temps.length).toFixed(1),
      description: dailyData[date].descriptions[Math.floor(dailyData[date].descriptions.length / 2)],
      icon: dailyData[date].icons[Math.floor(dailyData[date].icons.length / 2)]
    }));
  };

  return (
    <div
      className="container 
    mx-auto p-4"
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="city" className="block text-gray-700 font-bold mb-2">
            Enter City:
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={city}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="e.g., London"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Get Weather
        </button>
      </form>

      {error && (
        <p className="text-2xl text-bold text-red-500">Provide Valid City!</p>
      )}
      {!error && weatherData && (
        <div className="mt-4 text-center">
          <div className="text-center mb-3">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              onClick={toggleUnits}
            >
              {isCelsius ? "Fahrenheit" : "Celsius"}
            </button>
          </div>
          
          <h2 className="text-xl font-semibold mb-2">{weatherData.name}</h2>

          <div className="flex justify-center items-center mb-4">
            <img
              src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
              alt="Weather icon"
              className="w-16 h-16"
            />
            <p className="text-4xl font-bold">
              {getTemperature(weatherData.main.temp)}
            </p>
          </div>
          <p className="text-lg mb-2">{weatherData.weather[0].description}</p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p>Min: {getTemperature(weatherData.main.temp_min)}</p>
              <p>Max: {getTemperature(weatherData.main.temp_max)}</p>
            </div>
            <div>
              <p>Humidity: {weatherData.main.humidity}%</p>
              <p>
                Wind: {weatherData.wind.speed} m/s, {weatherData.wind.deg}°
              </p>
            </div>
          </div>
        </div>
      )}
       
      {!error && forecastData && (
        <>
       <h2 className="mt-3 text-center font-semibold text-xl">forecast for five days</h2>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            
        {forecastData.map((day, index) => (
          <div key={index} className="bg-gray-100 p-4 rounded-lg text-center">
            <p className="font-semibold">{day.date}</p>
            <img
              src={`http://openweathermap.org/img/wn/${day.icon}@2x.png`}
              alt={day.description}
              className="w-16 h-16 mx-auto"
            />
            <p className="text-2xl font-bold">{getTemperature(day.avgTemp)}</p>
            <p className="text-sm">{day.description}</p>
          </div>
        ))}
      </div>
      </>
      )}
    </div>
   
  );
};

export default Weather;
