from starlette.config import Config
from starlette.datastructures import Secret

config = Config('.env')

OPEN_WEATHER_API_KEY = config('OPEN_WEATHER_API_KEY', cast=Secret)
