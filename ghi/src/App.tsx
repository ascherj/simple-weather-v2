import { useState } from 'react';
import './App.css';
import { Weather } from './types';

import Search from './components/Search';

function App() {
  const [currentWeather, setCurrentWeather] = useState<Weather | null>(null);

  return (
    <>
      <h1>Simple Weather</h1>
      <div className="card">
        <Search setCurrentWeather={setCurrentWeather} />
        {currentWeather && (
          <>
            <h2>
              {currentWeather.location.city},&nbsp;
              {currentWeather.location.state ? `${currentWeather.location.state}, ` : ''}
              {currentWeather.location.country}
            </h2>
            <p>{currentWeather.temperature}°F</p>
            <p>{currentWeather.description}</p>
          </>
        )}
      </div>
    </>
  );
}

export default App;
