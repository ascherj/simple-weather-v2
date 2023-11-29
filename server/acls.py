import re
import json

import requests

import settings
from dictionaries import state_abbreviations, country_abbreviations

def get_full_country_name(country_code):
    return country_abbreviations.get(country_code, None)

def format_search_term(search_term):
    # Check if the input is a ZIP code
    if re.match(r'^\d{5}$', search_term[:5]):
        return f'{search_term},US'

    # Split the search term into components
    components = [comp.strip() for comp in search_term.split(',')]

    # Ensure at least one component is present
    if not components:
        return None

    # Extract city, state, and country if available
    city = components[0]
    state = components[1] if len(components) > 1 else None
    country = components[2] if len(components) > 2 else None

    # Check if state is abbreviation and convert to full name if so
    if state and state.upper() in state_abbreviations:
        state = state_abbreviations[state.upper()]

    # Construct a formatted search term
    is_US_state = state and state in state_abbreviations.values()
    state_text = ',' + state if state else ''
    country_text = ',' + country if country else ',US' if is_US_state else ''

    formatted_search = f"{city}{state_text}{country_text}"

    return formatted_search

def get_weather_data(query):
    params = { "appid": settings.OPEN_WEATHER_API_KEY }

    formatted_search_term = format_search_term(query)
    print('Formatted search term:', formatted_search_term)

    # Check if the search term is a ZIP code
    is_zip = re.match(r'^\d{5}$', query)
    if is_zip:
        params["zip"] = formatted_search_term
    else:
        params["q"] = formatted_search_term
        params["limit"] = 5

    # Prepare the parameters for the geocoding API call
    url = f"http://api.openweathermap.org/geo/1.0/{'zip' if is_zip else 'direct'}"
    response = requests.get(url, params=params)
    content = json.loads(response.content)
    print(content)

    # Get the state associated with the search query, if possible
    state = None
    if isinstance(content, list) and len(content) > 0 and content[0].get("state"):
        state = content[0]["state"]

    # Get the country associated with the search query
    country = None
    if isinstance(content, list) and len(content) and content[0].get("country"):
        country = content[0]["country"]
    elif isinstance(content, dict) and content.get("country"):
        country = content["country"]
    country = get_full_country_name(country)

    # Get the latitude and longitude from the response
    try:
        latitude = content[0]["lat"] if not is_zip else content["lat"]
        longitude = content[0]["lon"] if not is_zip else content["lon"]
    except (KeyError, IndexError):
        return None

    # Prepare the parameters for the weather API call
    params = {
        "lat": latitude,
        "lon": longitude,
        "appid": settings.OPEN_WEATHER_API_KEY,
        "units": "imperial",
    }
    url = "https://api.openweathermap.org/data/2.5/weather"
    response = requests.get(url, params=params)
    content = json.loads(response.content)
    print(content)

    # Return dictionary of weather data if successful, otherwise return None
    try:
        return {
            "city": content["name"],
            "state": state,
            "country": country,
            "description": content["weather"][0]["description"],
            "temp": content["main"]["temp"],
        }
    except (KeyError, IndexError):
        return None
