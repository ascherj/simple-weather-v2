from starlette.applications import Starlette
from starlette.requests import Request
from starlette.responses import JSONResponse, PlainTextResponse
from starlette.routing import Route
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
import settings, acls

async def homepage(request: Request):
    return JSONResponse({'hello': 'world'})

async def weather(request: Request):
    location = request.query_params.get('location', 'San Francisco, CA')
    data = acls.get_weather_data(location)
    if data is None:
        return PlainTextResponse('Location not found', status_code=404)
    return JSONResponse(data)

routes = [
    Route('/', homepage, methods=['GET']),
    Route('/weather', weather, methods=['GET']),
]

middleware = [
    Middleware(CORSMiddleware, allow_origins=['*'])
]

app = Starlette(debug=True, routes=routes, middleware=middleware)
