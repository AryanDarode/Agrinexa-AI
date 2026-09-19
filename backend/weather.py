import os
import requests
from dotenv import load_dotenv

load_dotenv()

def get_weather(city):

    api_key = os.getenv("OPENWEATHER_API_KEY")

    url = "https://api.openweathermap.org/data/2.5/weather"

    params = {
        "q": city,
        "appid": api_key,
        "units": "metric"
    }

    response = requests.get(url, params=params)

    if response.status_code != 200:
        return None

    data = response.json()

    weather_data = {
        "Location": data["name"],
        "Temperature_C": data["main"]["temp"],
        "Humidity_%": data["main"]["humidity"],
        "Wind_Speed_m_s": data["wind"]["speed"],
        "Rainfall_mm": data.get("rain", {}).get("1h", 0),
        "Cloud_%": data["clouds"]["all"],
        "Condition": data["weather"][0]["description"]
    }

    return weather_data