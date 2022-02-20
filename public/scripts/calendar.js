////// API keys
let secrets = {
    openWeatherMap: '<secret-key>',
    calendarific: '<secret-key>'
};

async function fetchSecrets() {
    secrets = await (await fetch('/secrets.json')).json();
}

////// global variables
const monthNames = ['January','Feburary','March','April','May','June','July','August','September','October','November','December'];

let currentMonth = 1; // Feburary
let currentYear = 2022;

/// this is the list of all event sources for the current calendar
/// an event source is a function of type `Date -> [Event]` where an event is an object as follows:
/// Event {
///     className: the CSS class to apply to the tag, default is 'accent-bg' if not defined
///     title: the text to put inside the tag element, default is blank if not defined
///     priority: the sort order of the event, user-generated events are at priority 0, higher will go before, lower will go after
/// }
/// Each event source will be invoked with `null` at the start of calendar generation so they can do any per-month calculation/data fetching
let eventSources = [];

/// generate the calendar HTML for currentMonth, currentYear
async function calendarGenerate() {

    /// this function generates a DOM element from a calendar event returned from an event source function
    function generateTagFromEvent(event) {
        let el = document.createElement('div');
        el.className = 'cal-marker ' + (event.className || 'accent-bg');
        el.innerHTML = event.title || '';
        return el;
    }

    // make sure event sources are initialized for this month
    await Promise.all(eventSources.map(src => src(null)));

    // recreate the main calender
    let calendarDiv = document.getElementById('calendar');
    let calRows = calendarDiv.children;
    let currentDay = new Date(currentYear, currentMonth, 1);
    for(let row = 2; row < calRows.length; ++row) { // skip the first two rows that have the month title and day names in them
        calRows[row].innerHTML = ''; // clear the row
        for(let col = 0; col < 7; ++col) {
            let dayDiv = document.createElement('div');
            dayDiv.className = 'col cal-cell';
            // make sure we're still in the month, skipping the first and last couple boxes if necessary
            if(currentDay.getDay() == col && currentDay.getMonth() == currentMonth) {
                let dayNumber = document.createElement('span');
                dayNumber.className = 'day-number';
                dayNumber.innerHTML = currentDay.getDate();
                dayDiv.appendChild(dayNumber);

                // query for any events happening on this day
                let events = await Promise.all(eventSources.map(src => src(currentDay)))
                    .then(ev => ev.reduce((e,es) => es ? e.concat(es) : e, []));
                events
                    .sort((a,b) => (b.priority||0)-(a.priority||0))
                    .map(generateTagFromEvent)
                    .forEach(e => dayDiv.appendChild(e));

                currentDay.setDate(currentDay.getDate()+1);
            }
            calRows[row].appendChild(dayDiv);
        }
    }

    // update the calendar title
    document.getElementById('calendarTitle').innerHTML = monthNames[currentMonth] + ' ' + currentYear;
}

////// event source functions
const saturnDay = date => date && date.getDay() == 6 ? [ {title: '🪐', className: 'accent-tint-bg'} ] : [];

function dummyUserEvents(date) {
    if(!date) return;
    if(date.getMonth() == 2) {
        if(date.getDate() == 13) {
            return [{}, {}];
        }
        if(date.getDate() == 23) {
            return [{}];
        }
    }
}

function dummyGroupEvents(date) {
    if(!date) return;
    if(date.getMonth() == 2) {
        if(date.getDate() == 13) {
            return [{}];
        }
        if(date.getDate() == 23) {
            return [{}];
        }
    }
}

//// 16-day weather forecast
let forecastData = null;
async function loadForecastData() {
    const location = { lat: 40.24, lon: -111.65 };
    forecastData = await (await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${location.lat}&lon=${location.lon}&exclude=current,minutely,hourly,alerts&units=imperial&appid=${secrets.openWeatherMap}`)).json();
}

async function weatherForcast(date) {
    if(date == null) {
        await loadForecastData();
    } else {
        if(!forecastData) return [];
        let start_of_day = date.getTime() / 1000; // Javascript time is in milliseconds but OpenWeatherMap returns seconds
        let end_of_day = start_of_day + 3600*24;
        let res = forecastData.daily
            .filter(df => start_of_day <= df.dt && df.dt <= end_of_day)
            .map(df => ({title: `<img src="https://openweathermap.org/img/wn/${df.weather[0].icon}.png"/><span>${df.temp.day.toFixed(0)}&deg;</span>`, className: 'weather-event', priority: 10}));
        return res;
    }
}

//// Calendar Holidays
let holidayData = null;
async function loadHolidays(date) {
    holidayData = await (await fetch(`https://calendarific.com/api/v2/holidays?&api_key=${secrets.calendarific}&country=US&year=${currentYear}&month=${currentMonth+1}&type=national`)).json();
    holidayData = holidayData.response.holidays;
}

async function getHolidays(date) {
    if (date == null) {
        await loadHolidays(date);
    } else {
        if (!holidayData) return [];
        holidayData.forEach(holi => {
            holi.title = holi.name;
            holi.className = 'holiday';
        });
        return holidayData.filter(holi => holi.date.datetime.day == date.getDate());
    }
}

////// input event handlers
function calendarPrevMonth() {
    currentMonth = currentMonth-1;
    if(currentMonth < 0) {
        currentMonth = 11;
        currentYear -= 1;
    }
    calendarGenerate();
}

function calendarNextMonth() {
    currentMonth = currentMonth+1;
    if(currentMonth > 11) {
        currentMonth = 0;
        currentYear += 1;
    }
    calendarGenerate();
}

////// page init functions
/// these functions are called when the page is loaded, setting up the event source list and initial calendar

/// init the `user_cal.html` page
async function initUser() {
    eventSources = [dummyUserEvents, weatherForcast, getHolidays];
    await fetchSecrets();
    await calendarGenerate();
}

/// init the `group_cal.html` page
async function initGroup() {
    eventSources = [dummyGroupEvents, weatherForcast, getHolidays];
    await fetchSecrets();
    await calendarGenerate();
}
