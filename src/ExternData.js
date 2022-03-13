import { useState, useEffect } from 'react';

export function useSecrets() {
    const [secrets, setSecrets] = useState(null);

    useEffect(() => {
        if(secrets == null) {
            fetch('/secrets.json')
                .then(r => r.json())
                .then(setSecrets);
        }
    }, [secrets]);

    return secrets;
}

export function useWeatherData(secrets) {
    const [currentForecast, setForecast] = useState(null);

    useEffect(() => {
        async function getForecast(location) {
            return await (await fetch(
                `https://api.openweathermap.org/data/2.5/onecall?lat=${location.lat}&lon=${location.lon}&exclude=current,minutely,hourly,alerts&units=imperial&appid=${secrets.openWeatherMap}`
            )).json();
        }

        if(currentForecast == null && secrets?.openWeatherMap) {
            getForecast({lat: 40.24, lon: -111.65})
                .then(data => setForecast(data.daily));
        }
    }, [currentForecast, secrets]);

    return currentForecast;
}

export function useHolidayData(secrets, month, year) {
    const [holidayData, setHolidayData] = useState(null);

    useEffect(() => {
        async function getHolidays() {
            return (await (await fetch(
                `https://calendarific.com/api/v2/holidays?&api_key=${secrets.calendarific}&country=US&year=${year}&month=${month+1}&type=national`
            )).json());
        }


        if(holidayData?.dateRequested[0] != month && holidayData?.dateRequested[1] != year && secrets?.calendarific) {
            getHolidays()
                .then(d => setHolidayData({
                    dateRequested: [month, year],
                    data: d.response.holidays
                }))
        }
    }, [secrets, month, year, holidayData]);

    return holidayData;
}
