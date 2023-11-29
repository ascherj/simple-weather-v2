export type Weather = {
  location: {
    city: string;
    state: string;
    country: string;
  };
  temperature: number;
  description: string;
};
