// Create a new router
const express = require("express");
const router = express.Router();
const request = require('request');

// Handle home route
router.get('/', function (req, res, next) {
  res.render('index.ejs');
});

// About page route
router.get('/about', function (req, res, next) {
  res.render('about.ejs');
});

// Weather page route
router.get('/weather', function (req, res, next) {
  let apiKey = '13400a408d993046228e527c0dd4850e';
  let city = req.query.city || 'london';
  let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
                     
  request(url, function (err, response, body) {
    if(err){
      next(err);
    } else {
      var weather = JSON.parse(body);
      if (weather !== undefined && weather.main !== undefined) {
        res.render('weather.ejs', { weather: weather, city: city });
      } else {
        res.render('weather.ejs', { weather: null, city: city, error: 'No data found' });
      }
    } 
  });
});

// Export the router object so index.js can access it
module.exports = router;
