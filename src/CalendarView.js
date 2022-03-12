import { useState, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import './styles/calendar.css';
import { useSecrets, useWeatherData, useHolidayData } from './ExternData.js';
import { Feed } from './FeedView.js';

function mapRange(start, end, fn) {
    let result = [];
    for(let i = start; i < end; ++i) {
        console.log(i);
        result.push(fn(i));
    }
    return result;
}

function dateEq(a, b) {
    return a.getYear() == b.getYear()
        && a.getMonth() == b.getMonth()
        && a.getDate() == b.getDate();
}

const monthNames = [
    'January','Feburary','March','April','May','June','July','August','September','October','November','December'
];

function CalendarCell({date, children, selected, onSelect, today, dayForecast}) {
    return (
        <div onClick={onSelect} className="col cal-cell">
            <div style={{display:'flex', justifyContent: 'space-between', margin: '0.2rem 0rem', flexWrap: 'wrap'}}>
                {date &&
                    <div className={"day-number " + (selected && " accent-tint-bg main-fg")}
                        style={{fontWeight: today?'bold':'normal'}}>
                        {date.getDate()}
                    </div>}
                {dayForecast &&
                    <div className="weather-event">
                        <img src={`https://openweathermap.org/img/wn/${dayForecast.weather[0].icon}.png`}/>
                        <span>{dayForecast.temp.day.toFixed(0)}&deg;</span>
                    </div>}
            </div>
            {children}
        </div>
    );
}

function EventTag({data}) {
    return (
        <div className={"cal-marker accent-bg"}>
            <span className="main-fg">{data.title}</span>
        </div>
    );
}

export function CalendarView({events}) {
    const now = new Date();
    const [currentYear, setCurrentYear] = useState(now.getYear() + 1900);
    const [currentMonth, setCurrentMonth] = useState(now.getMonth());
    const [selectedDay, setSelectedDay] = useState(now.getDate());

    const secrets = useSecrets();
    const currentForecast = useWeatherData(secrets);
    const holidays = useHolidayData(secrets, currentMonth, currentYear);

    // recreate the main calendar
    let calRows = [];
    let currentDay = new Date(currentYear, currentMonth, 1);
    for(let row = 0; row < 5; ++row) {
        let calRow = [];
        for(let col = 0; col < 7; ++col) {
            // make sure we're still in the month, skipping the first and last couple boxes if necessary
            if(currentDay.getDay() == col && currentDay.getMonth() == currentMonth) {
                let currentDate = currentDay.getDate();
                let start_of_day = currentDay.getTime() / 1000;
                let end_of_day = start_of_day + 3600*24;
                calRow.push(
                    <CalendarCell
                        key={col} date={new Date(currentDay)}
                        today={dateEq(now, currentDay)} selected={selectedDay == currentDate}
                        onSelect={()=>setSelectedDay(currentDate)}
                        dayForecast={currentForecast?.filter(df => start_of_day <= df.dt && df.dt <= end_of_day)[0]}
                    >
                        {events
                            .filter(ev => dateEq(ev.date, currentDay))
                            .map(ev => <EventTag key={ev.id} data={ev}/>)}
                        {holidays?.data
                                ?.filter(h => h.data.datetime.day == currentDate)
                                .map((h,i) => <EventTag key={`holiday${i}`} data={{title: h.name}}/>)}
                    </CalendarCell>
                );
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
        <>
        <div className="container cal col" id="calendar">
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
        <div className="col-xl-4 day-feed feed">
            {<Feed events={events.filter(event => dateEq(event.date, currentDay))}/>}
        </div>
        </>
    );
}
