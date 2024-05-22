from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


import acls

app = FastAPI()

origins = [
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def homepage():
    return {"hello": "world"}

@app.get("/weather")
def weather(location: str):
    data = acls.get_weather_data(location)
    if data is None:
        return "Location not found", 404
    return data
