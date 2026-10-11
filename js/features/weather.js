function weatherFromCode(code, precipitation) {
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
        return 'snow';
    }
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code > 95 || precipitation > 0) {
        return 'rain';
    }
    return 'clear';
}

export async function fetchWeather() {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=61.06&longitude=28.19&current=temperature_2m,precipitation,weather_code', {
            signal: controller.signal
        });
        if (!response.ok) {
            throw new Error('HTTP ' + response.status);
        }
        const data = await response.json();
        const curr = data.current;
        return {
            kind: weatherFromCode(curr.weather_code, curr.precipitation),
            temp: Math.round(curr.temperature_2m),
            source: 'live'
        };
    } catch (error) {
        return {
            kind: 'clear',
            temp: null,
            source: 'offline'
        }
    } finally {
        clearTimeout(timer);
    }
}