const dtList = document.querySelector('#languages');
const list = document.querySelector("#list");
const weatherLon = document.querySelector(".weather-lon")
const weatherLat = document.querySelector(".weather-lat")
const button = document.querySelector('.btn-location');
const containerMain = document.querySelector('.container-main')
let arrDate = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
let arrMonth = ['January', 'February', 'March', 'April', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
// read file vn.json get data.
async function readApi(){
    let apiURL = `http://localhost:3000/provine`
    datas = await fetch(apiURL).then(res => res.json())
    let html = '';
    datas.forEach(data => {
        html += `<option value="${data.name}"/>`
    });
    dtList.innerHTML = html;
    // Click button on location
    button.addEventListener("click", function(){
        const location = list.value.trim();
        console.log(location)
        const location1 = datas.filter(data =>{
            return data.name == location;
        })
        let lon = location1[0].coord.lon;
        let lat = location1[0].coord.lat;
        console.log(location1)
        changeWeatherByLocation(location);
        renderGeolocation(lon, lat)
        renderToChart(lat, lon);
    })
    
}

readApi();

// Hiển thị thời tiết địa điểm qua location

async function changeWeatherByLocation(location){
    let apiURL = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=1180577d4f7a0b5f15be8ed79c502c16`
    let data = await fetch(apiURL).then(res => res.json())
    console.log(data);
    renderWeatherNow(data);
}

// Hàm hiển thị kinh độ, vĩ độ
function renderGeolocation(lon, lat){
    weatherLon.innerText = `Kinh độ: ${lon}`;
    weatherLat.innerText = `Vĩ độ: ${lat}`;
}



// Hàm xử lý thời gian

function handleTime(date){
    let d;
    date ? d = new Date(date * 1000) : d = new Date();
    return{
        day:() => d.getDay(),
        date:() => d.getDate(),
        month:() => d.getMonth(),
        year:() => d.getFullYear(),
        hours: () => d.getHours(),
        fullTime: () => `${d.getHours()}:${d.getMinutes() > 9 ? d.getMinutes() : '0' + d.getMinutes()}`,
        fullDate: function () {
            return `${arrDate[d.getDay()]} ${d.getDate() }/${d.getMonth()+1}/${ d.getFullYear()}`
        },
        dm: function () {
            return `${this.date()}/${this.month()}`
        }
    }
}

// Hàm render thời tiết hiện tại
function renderWeatherNow(data){
    if(data.cod === 200){
        let html = `<div class="container-time">
        <h2 class="location">${data.name}</h2>
        <p class="hours">${handleTime().fullTime()}</p>
        <p class="days">${handleTime().fullDate()}</p>
        <p class="sunrise"><img src="./images/sunrise.svg" alt=""><span> ${handleTime(data.sys.sunrise).fullTime()}</span></p>
        <p class="sunset"><img src="./images/sunset.svg" alt=""><span> ${handleTime(data.sys.sunset).fullTime()}</span></p>
    </div>
    <div class="container-information">
        <div class="tempurature">
            <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}" />
            <h1>${Math.round((data.main.temp) -273.15)} &deg;C</h1>
        </div>
        <div class="description">
            <p>mây: ${data.clouds.all}%</p>
            <p>Tốc độ gió:${data.wind.speed}m/s</p>
        </div>
    </div>
    <div class="container-more">
        <p>Độ ẩm:  ${data.main.humidity}%</p>
        <p>Cảm thấy như:  ${Math.round((data.main.feels_like) - 273.15)} &deg;C</p>
        <p>Áp suất:  ${data.main.pressure} hPa</p>
    </div>`;
        containerMain.innerHTML = html;
    }
}

//Lấy địa điểm thông qua kinh độ, vĩ độ.
async function renderToChart(lat, lon){
    let apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&lang=vi&appid=a684070d41eeed9f0ba0d45c3738dfce`
    let data = await fetch(apiUrl).then(res => res.json())
    console.log(data);
    showChart(data);
    showDaily(data);
    renderWeatherNow(data);
}

// Biểu đồ dự báo theo giờ
function showChart() {
    let showChart = document.querySelector(".weatherNow__chart")
    let chartHtml = ''
    for (let i = 0; i < 10; i++) {
        if (hourly[i].dt)
            chartHtml += `
                     <div class="--item"
                         style="height: ${(hourly[i].temp * 4).toFixed()}px;"
                        data-desc="${hourly[i].weather[0].description}"
                         data-time="${handleTime(hourly[i].dt).fullTime()}">
                      <img src="http://openweathermap.org/img/wn/${hourly[i].weather[0].icon}@2x.png" />
                        <h2>
                            ${hourly[i].temp.toFixed()}&deg;
                        </h2>
                    </div>
                    `
    }
    showChart.innerHTML = chartHtml
}

//Khung dự báo hàng ngày
function showDaily(data){
    const containerRight = document.querySelector('.container-right')
    let htmlDaily = '';
    for(let i = 1; i < 7; i++){
        htmlDaily = ` 
        <div class="__daily--item">
        <span>  <p>${arrDate[handleTime(data.daily[i].dt).day()]}</p>${handleTime(data.daily[i].dt).dm()}</span>
        <span>
            <img src="http://openweathermap.org/img/wn/${data.daily[i].weather[0].icon}@2x.png" />
        </span>
        <span>  <p>${data.daily[i].temp.max.toFixed(1)}&deg;</p> ${data.daily[i].temp.min.toFixed(1)}&deg;   </span>

    </div>`
    containerRight.innerHTML += htmlDaily;
    }
    
}