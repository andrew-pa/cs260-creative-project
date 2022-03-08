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
    async function getForecast(location) {
        return await (await fetch(
            `https://api.openweathermap.org/data/2.5/onecall?lat=${location.lat}&lon=${location.lon}&exclude=current,minutely,hourly,alerts&units=imperial&appid=${secrets.openWeatherMap}`
        )).json();
    }

    const [currentForecast, setForecast] = useState(null);

    useEffect(() => {
        if(currentForecast == null && secrets?.openWeatherMap) {
            getForecast({lat: 40.24, lon: -111.65})
                .then(data => setForecast(data.daily));
        }
    }, [currentForecast, secrets]);

    return currentForecast;
}
