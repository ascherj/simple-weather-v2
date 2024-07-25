import { corsHeaders } from '../_shared/cors.ts'

// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts"
import { formatSearchTerm, getFullCountryName } from '../_utils/weather.ts'

console.log("Hello from Functions!")

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS request received')
    return new Response('ok', { headers: corsHeaders })
  }

  const searchParams = new URLSearchParams(req.url.split("?")[1])
  const location = searchParams.get("location")

  const apiParams = {
    "appid": Deno.env.get("OPEN_WEATHER_API_KEY"),
  }

  const formattedSearchTerm = formatSearchTerm(location)
  console.log("Formatted search term:", formattedSearchTerm)

  const isZIP = /^\d{5}$/.test(formattedSearchTerm.slice(0, 5))
  if (isZIP) {
    apiParams["zip"] = formattedSearchTerm
  } else {
    apiParams["q"] = formattedSearchTerm
    apiParams["limit"] = 5
  }

  // Prepare the parameters for the geocoding API call
  let url = `http://api.openweathermap.org/geo/1.0/${isZIP ? "zip" : "direct"}`
  let response = await fetch(`${url}?${new URLSearchParams(apiParams)}`)
  let data = await response.json()
  console.log("Data:", data)

  // Get the state associated with the search query, if possible
  let state = null
  if (Array.isArray(data) && data.length > 0 && data[0].state) {
    state = data[0].state
  }

  // Get the country associated with the search query
  let country = null
  if (Array.isArray(data) && data.length > 0 && data[0].country) {
    country = data[0].country
  } else if (typeof data === 'object' && !Array.isArray(data) && data.country) {
    country = data.country
  }
  country = getFullCountryName(country)

  // Get the latitude and longitude from the response
  let latitude = null
  let longitude = null
  try {
    latitude = !isZIP ? data[0].lat : data.lat
    longitude = !isZIP ? data[0].lon : data.lon
  } catch (error) {
    console.error("Error getting latitude and longitude:", error)
  }

  // Prepare the parameters for the weather API call
  const weatherParams = {
    "lat": latitude,
    "lon": longitude,
    "units": "imperial",
    "appid": Deno.env.get("OPEN_WEATHER_API_KEY"),
  }
  url = `http://api.openweathermap.org/data/2.5/weather`
  response = await fetch(`${url}?${new URLSearchParams(weatherParams)}`)
  data = await response.json()
  console.log("Data:", data)

  // Return dictionary of weather data if successful, otherwise return null
  try {
    data = {
      "city": data.name,
      "state": state,
      "country": country,
      "temp": data.main.temp,
      "description": data.weather[0].description,
    }
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  } catch (error) {
    console.error("Error getting weather data:", error)
    return new Response(
      JSON.stringify(null),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/weather' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
