

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();
const PORT=3000;


require('dotenv').config();

const apiKey = `${process.env.API_KEY}`;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');


app.get('/', function(req, res) {

    res.render('index', { weather: null, error: null });
});

app.post('/', function(req, res) {

    let city = req.body.city;
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    
    // Request for data using the URL
    request(url, function(err, response, body) {
        

        if (err) {
            res.render('index', { weather: null, error: 'Error, please try again' });
        } else {
            let weather = JSON.parse(body);
            // console.log(weather);

            if (weather.main == undefined) {
                res.render('index', { weather: null, error: 'Error, please try again' });
            } else {

                let regionNames = new Intl.DisplayNames(['en'], {type: 'region'});
                let place = `${weather.name}, ${regionNames.of(weather.sys.country)}`,

                    // weatherTimezone = `${new Date(weather.dt * 1000)}`;
                var weatherIcon = `http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`,
                    lat=`${weather.coord.lat}`,
                    lon=`${weather.coord.lon}`;
                let url2 = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&appid=${apiKey}&units=metric`;
                let url3= `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
                // console.log(url3);
                let aqi=0;
                request(url3, function(err,response,body){
                    let air=JSON.parse(body);
                    var airQuality=['Good','Fair','Moderate','Poor','Very Poor'];
                    // console.log(air.list[0].main.aqi);
                    aqi=airQuality[air.list[0].main.aqi-1];
                })
                request(url2 , function(err,response,body){
                    let data=JSON.parse(body);
                    // console.log(data);
                    var weekDay=[];
                    var fIcon=[];
                    var fTempMin=[];
                    var fTempMax=[];
                    for (let i=0;i<=7;i++){
                        weekDay.push(new Date(data.daily[i].dt*1000).toLocaleDateString("en-GB",{ weekday:'long'})); 
                        fIcon.push(`http://openweathermap.org/img/wn/${data.daily[i].weather[0].icon}@2x.png`);
                        fTempMin.push(data.daily[i].temp.min);
                        fTempMax.push(data.daily[i].temp.max);
                    }
                    var uvi=`${data.current.uvi}`,
                        windSpeed=`${data.current.wind_speed}`,
                        weatherDescription = `${data.current.weather[0].description}`,
                        humidity = `${data.current.humidity}`,
                        clouds = `${data.current.clouds}`,
                        visibility = `${data.current.visibility}`,
                        main = `${data.current.weather[0].main}`,
                        weatherTemp = `${data.current.temp}`,
                        weatherPressure = `${data.current.pressure}`,
                        windDir=`${data.current.wind_deg}`;
                    if (visibility==10000) visibility=">"+visibility;
                    res.render('index', { weather: weather, place: place, temp: weatherTemp, pressure: weatherPressure, 
                        icon: weatherIcon, description: weatherDescription, timezone: weatherTimezone, humidity: humidity, 
                        clouds: clouds, visibility: visibility, main: main, weekDay:weekDay, fIcon:fIcon, fTempMax:fTempMax,
                        fTempMin:fTempMin, uvi:uvi , windSpeed:windSpeed, windDir:getCardinalDirection(windDir),aqi:aqi,error: null });
            })                
            }
        }
    });
});

function getCardinalDirection(angle) {
    const directions = ['↑ N', '↗ NE', '→ E', '↘ SE', '↓ S', '↙ SW', '← W', '↖ NW'];
    return directions[Math.round(angle / 45) % 8];
}

app.listen(PORT, function() {
    console.log('Weather app listening on port ',PORT);
});