const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const app = express();

// app.use(bodyParser.urlencoded({extended: true}));
//
// app.get("/", function(req, res){
//   res.sendFile(__dirname + "/index.html");
// });
//
// app.post("/", function(req, res){
//   const query = req.body.cityName;
//   const apiKey = "b28afb772f06b1bccd195d0220262e64";
//   const unit = "metric"
//   const url = "https://api.openweathermap.org/data/2.5/weather?q=" + query + "&appid=" + apiKey + "&units=" + unit;
//
//   https.get(url, function(response){
//     console.log(response.statusCode);
//
//
//     response.on("data", function(data){
//       const weatherData = JSON.parse(data)
//       const temp = weatherData.main.temp
//       const weatherDescription = weatherData.weather[0].description
//       const icon = weatherData.weather[0].icon
//       const imageURL = "http://openweathermap.org/img/wn/" + icon + "@2x.png"
//       res.write("<p>The weather is currently " + weatherDescription + "</p>");
//       res.write("<h1>The temperature in " + query +" is " + temp + "degrees Celcius.</h1>");
//       res.write("<img src=" + imageURL + ">");
//       res.send();
//     });
//   });
// })


async function getDateTime(city) {
  const apiUrl = `https://worldtimeapi.org/api/timezone/Europe/${city}.json`;

  return new Promise((resolve, reject) => {
    https.get(apiUrl, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        if (response.statusCode === 200) {
          const parsedData = JSON.parse(data);
          resolve(parsedData.datetime);
        } else {
          reject(new Error(`Failed to fetch date and time for ${city}`));
        }
      });
    });
  });
}


app.post("/", async function (req, res) {
  const query = req.body.cityName;
  const apiKey = "b28afb772f06b1bccd195d0220262e64";
  const unit = "metric";
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${apiKey}&units=${unit}`;

  try {
    // Fetch weather data
    const weatherDataResponse = await fetchWeatherData(weatherUrl);

    // Fetch date and time
    const dateTime = await getDateTime(query);

    const { temp, description, icon } = weatherDataResponse;
    const imageURL = `http://openweathermap.org/img/wn/${icon}@2x.png`;

    // Construct HTML response with weather information and date/time
    const htmlResponse = `
      <p>The weather is currently ${description}</p>
      <h1>The temperature in ${query} is ${temp} degrees Celsius.</h1>
      <p>Date and Time in ${query}: ${dateTime}</p>
      <img src="${imageURL}">
    `;

    res.send(htmlResponse);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("An error occurred while fetching data.");
  }
});

// Function to fetch weather data
function fetchWeatherData(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        if (response.statusCode === 200) {
          const weatherData = JSON.parse(data);
          const temp = weatherData.main.temp;
          const description = weatherData.weather[0].description;
          const icon = weatherData.weather[0].icon;
          resolve({ temp, description, icon });
        } else {
          reject(new Error('Failed to fetch weather data.'));
        }
      });
    });
  });
}


app.listen(3000, function(req, res){
  console.log("Server started on port 3000.");
})
