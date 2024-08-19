import { useState, Dispatch, SetStateAction } from 'react';
import api from '../api/api';
import { Weather } from '../types';
import './Search.css';

interface SearchProps {
  setCurrentWeather: Dispatch<SetStateAction<Weather | null>>;
}

function Search(props: SearchProps): React.JSX.Element {
  const [location, setLocation] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(event.target.value);
  };

  const getWeather = () => {
    api
      .get('/weather', {
        params: { location },
      })
      .then(({ data: { city, state, country, lat, lon, temp, description } }) => {
        props.setCurrentWeather({
          location: {
            city: city,
            state: state,
            country: country,
            lat: lat,
            lon: lon,
          },
          temperature: temp,
          description: description,
        });
      })
      .catch((err) => {
        console.log(err);
        alert('There was a problem getting the weather. Please try again.');
      });
  };

  return (
    <>
      <input
        type="text"
        placeholder="City, state, zip code..."
        onChange={handleInputChange}
      />
      <button type="button" onClick={getWeather}>
        Submit
      </button>
    </>
  );
}

export default Search;
