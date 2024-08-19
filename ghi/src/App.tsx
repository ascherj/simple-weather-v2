import { useState } from 'react';
import 'leaflet/dist/leaflet.css';
import './App.css';
import { Weather } from './types';

import Search from './components/Search';
import Map from './components/Map';

function App() {
  const [currentWeather, setCurrentWeather] = useState<Weather | null>(null);

  const location = currentWeather?.location;
  const temperature = currentWeather?.temperature;
  const description = currentWeather?.description;

  const city = location?.city;
  const state = location?.state;
  const country = location?.country;
  const lat = location?.lat;
  const lon = location?.lon;

  return (
    <>
      <h1>Simple Weather</h1>
      <div className="card">
        <Search setCurrentWeather={setCurrentWeather} />
        {currentWeather && (
          <>
            <h2>
              {city},&nbsp;
              {state ? `${state}, ` : ''}
              {country}
            </h2>
            <p>{temperature}°F</p>
            <p>{description}</p>
            {lat && lon && (<Map latitude={lat} longitude={lon} />)}
          </>
        )}
      </div>
    </>
  );
}

export default App;
