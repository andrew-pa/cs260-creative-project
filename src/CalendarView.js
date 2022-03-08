import { useState, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import './styles/calendar.css';

function mapRange(start, end, fn) {
    let result = [];
    for(let i = start; i < end; ++i) {
        console.log(i);
        result.push(fn(i));
    }
    return result;
}

const monthNames = ['January','Feburary','March','April','May','June','July','August','September','October','November','December'];

function CalendarCell({date}) {
    return (
        <div className="col cal-cell">
            {date &&
                <span className="day-number">{date.getDate()}</span>}
        </div>
    );
}

export function CalendarView({data}) {
    let [currentYear, setCurrentYear] = useState(2022);
    let [currentMonth, setCurrentMonth] = useState(2);

    // recreate the main calendar
    let calRows = [];
    let currentDay = new Date(currentYear, currentMonth, 1);
    for(let row = 0; row < 5; ++row) {
        let calRow = [];
        for(let col = 0; col < 7; ++col) {
            // make sure we're still in the month, skipping the first and last couple boxes if necessary
            if(currentDay.getDay() == col && currentDay.getMonth() == currentMonth) {
                calRow.push(<CalendarCell key={col} date={new Date(currentDay)}/>);

                // query for any events happening on this day
                /*let events = await Promise.all(eventSources.map(src => src(currentDay)))
                    .then(ev => ev.reduce((e,es) => es ? e.concat(es) : e, []));
                events
                    .sort((a,b) => (b.priority||0)-(a.priority||0))
                    .map(generateTagFromEvent)
                    .forEach(e => dayDiv.appendChild(e));*/

                    currentDay.setDate(currentDay.getDate()+1);
            } else {
                calRow.push(<CalendarCell key={col} date={null}/>);
            }
        }
        calRows.push(<div className="row" key={row}>{calRow}</div>);
    }

    function prevMonth() {
        let nm = currentMonth-1;
        if(nm < 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear-1);
        } else {
            setCurrentMonth(nm);
        }
    }

    function nextMonth() {
        let nm = currentMonth+1;
        if(nm > 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear+1);
        } else {
            setCurrentMonth(nm);
        }
    }

    return (
        <div className="container cal" id="calendar">
            <div className="row justify-content-center">
                <div className="col-1"><Button onClick={prevMonth}>&#129092;</Button></div>
                <h1 className="col" id="calendarTitle">{monthNames[currentMonth] + ' ' + currentYear}</h1>
                <div className="col-1"><Button onClick={nextMonth}>&#129094;</Button></div>
            </div>
            <div className="row day-titles">
                <div className="col">Su</div>
                <div className="col">M</div>
                <div className="col">Tu</div>
                <div className="col">W</div>
                <div className="col">Th</div>
                <div className="col">F</div>
                <div className="col">Sa</div>
            </div>
            {calRows}
        </div>
    );
}
