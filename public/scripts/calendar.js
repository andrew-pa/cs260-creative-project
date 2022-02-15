
const monthNames = ['January','Feburary','March','April','May','June','July','August','September','October','November','December'];

let currentMonth = 2;
let currentYear = 2021;

const saturnDay = date => date.getDay() == 6 ? [ {title: '🪐', className: 'accent-tint-bg'} ] : [];

function dummyUserEvents(date) {
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
    if(date.getMonth() == 2) {
        if(date.getDate() == 13) {
            return [{}];
        }
        if(date.getDate() == 23) {
            return [{}];
        }
    }
}

let eventSources = [];

function calendarGenerate() {
    function generateTagFromEvent({className, title}) {
        let el = document.createElement('div');
        el.className = 'cal-marker ' + (className || 'accent-bg');
        el.innerHTML = title || '';
        return el;
    }

    let calendarDiv = document.getElementById('calendar');
    let calRows = calendarDiv.children;
    let currentDay = new Date(currentYear, currentMonth, 1);
    for(let row = 2; row < calRows.length; ++row) {
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

                eventSources.map(source => source(currentDay) || [])
                    .reduce((a,e) => a.concat(e), [])
                    .map(generateTagFromEvent)
                    .forEach(e => dayDiv.appendChild(e));

                currentDay.setDate(currentDay.getDate()+1);
            }
            calRows[row].appendChild(dayDiv);
        }
    }
    document.getElementById('calendarTitle').innerHTML = monthNames[currentMonth] + ' ' + currentYear;
}

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

function initUser() {
    eventSources = [saturnDay, dummyUserEvents];
    calendarGenerate();
}

function initGroup() {
    eventSources = [saturnDay, dummyGroupEvents];
    calendarGenerate();
}
