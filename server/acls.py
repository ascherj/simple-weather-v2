import re
import json

import requests

import settings
from dictionaries import state_abbreviations, country_abbreviations


# def get_country_code(partial_name):
#     partial_name = partial_name.lower()  # Convert to lowercase for case-insensitive matching

#     for code, country_name in country_abbreviations.items():
#         country_name_lower = country_name.lower()

#         # Use regular expression to check for whole word match
#         if re.search(rf'\b{re.escape(partial_name)}\b', country_name_lower):
#             return code

#     return None  # Return None if no match is found

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

    is_US_state = state and state in state_abbreviations.values()

    # Construct a formatted search term
    state_text = ',' + state if state else ''
    country_text = ',' + country if country else ',US' if is_US_state else ''

    formatted_search = f"{city}{state_text}{country_text}"

    return formatted_search

def get_weather_data(query):
    params = {
        "appid": settings.OPEN_WEATHER_API_KEY,
    }

    formatted_search_term = format_search_term(query)
    print('Formatted search term:', formatted_search_term)

    is_zip = re.match(r'^\d{5}$', query)
    if is_zip:
        params["zip"] = formatted_search_term
    else:
        params["q"] = formatted_search_term
        params["limit"] = 5



    url = f"http://api.openweathermap.org/geo/1.0/{'zip' if is_zip else 'direct'}"
    response = requests.get(url, params=params)
    content = json.loads(response.content)
    print(content)

    try:
        latitude = content[0]["lat"] if not is_zip else content["lat"]
        longitude = content[0]["lon"] if not is_zip else content["lon"]
    except (KeyError, IndexError):
        return None

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

    try:
        return {
            "city": content["name"],
            "country": content["sys"]["country"],
            "description": content["weather"][0]["description"],
            "temp": content["main"]["temp"],
        }
    except (KeyError, IndexError):
        return None
