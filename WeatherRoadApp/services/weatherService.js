import Constants from 'expo-constants';

const API_KEY = Constants.expoConfig?.extra?.OPENWEATHER_API_KEY;

export async function getWeather(lat, lon) {
  try {
    if (!API_KEY) {
      throw new Error('OpenWeather API raktas nerastas');
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=lt&appid=${API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP klaida! statusas: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Oro prognozės gavimo klaida:', error);
    throw error;
  }
}

export async function getForecast(lat, lon) {
  try {
    if (!API_KEY) {
      throw new Error('OpenWeather API raktas nerastas');
    }

    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=lt&appid=${API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP klaida! statusas: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Oro prognozės gavimo klaida:', error);
    throw error;
  }
}