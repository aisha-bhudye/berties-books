
const express = require('express');
const router = express.Router();
const request = require('request');

// Weather route
router.get('/', (req, res, next) => {
  let city = req.query.city || 'london';
  let apiKey = process.env.OWM_API_KEY;
  let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
  
  // Make the API request
  request(url, function (err, response, body) {
    if (err) {
      next(err);
    } else {
      // Parse the JSON response
      var weather = JSON.parse(body);
      
      // Error handling: check if weather data exists 
      if (weather !== undefined && weather.main !== undefined) {
        // Extract weather data 
        var weatherData = {
          city: weather.name,
          temp: weather.main.temp,
          humidity: weather.main.humidity,
          description: weather.weather[0].description,
          wind: weather.wind.speed
        };
        
        // Render the view with weather data
        res.render('weather', { 
          weather: weatherData, 
          error: null, 
          queryCity: city 
        });
      } else {
        // No data found - render with error
        res.render('weather', { 
          weather: null, 
          error: 'No data found', 
          queryCity: city 
        });
      }
    }
  });
});

module.exports = router;