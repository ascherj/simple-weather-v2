export type Location = {
  city: string;
  state: string;
  country: string;
  lat: number;
  lon: number;
};

export type Weather = {
  location: Location;
  temperature: number;
  description: string;
};
