import { useState, Dispatch, SetStateAction } from 'react';
import axios from 'axios';
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
    axios.get('http://localhost:8000/weather', {
      params: { location },
    })
      .then(({ data: { city, state, country, temp, description }}) => {
        props.setCurrentWeather({
          location: {
            city: city,
            state: state,
            country: country
          },
          temperature: temp,
          description: description,
        });
      })
      .catch((err) => {
        console.log(err);
        alert('There was a problem getting the weather. Please try again.')
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
