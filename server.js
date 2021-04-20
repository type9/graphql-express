const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const { buildSchema } = require('graphql')
require('dotenv').config()
const fetch = require('node-fetch')

const apikey = process.env.OPENWEATHERMAP_API_KEY

const schema = buildSchema(`
# schema here
enum Units {
	standard
	metric
	imperial
}

type Weather {
	temperature: Float
    description: String
    feelsLike: Float
    tempMin: Float
    tempMax: Float
    pressure: Int
    humidity: Int
    cod: Int!
    message: String
}

type Query {
	getWeather(zip: Int!, units: Units): Weather!
}
`)

const root = {
    getWeather: async ({ zip, units = 'imperial' }) => {
          const apikey = process.env.OPENWEATHERMAP_API_KEY
          const url = `https://api.openweathermap.org/data/2.5/weather?zip=${zip}&appid=${apikey}&units=${units}`
          const res = await fetch(url)
          const json = await res.json()
          const cod = json.cod
          if(cod !== 200){
            const message = json.message
            return {cod: cod, message: message}
        }
          const temperature = json.main.temp
          const description = json.weather[0].description
          const feelsLike = json.main.feels_like
          const tempMin = json.main.temp_min
          const tempMax = json.main.temp_max
          const pressure = json.main.pressure
          const humidity = json.humidity
          let returnData = { temperature, description, feelsLike, tempMin, tempMax, pressure, humidity }
          return returnData
      }
  }

// Create an express app
const app = express()

// Define a route for GraphQL
app.use('/graphql', graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true
}))

// Start this app
const port = 4000
app.listen(port, () => {
    console.log('Running on port:'+port)
})