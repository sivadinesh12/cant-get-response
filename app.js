const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')

const databasePath = path.join(__dirname, 'covid19IndiaPortal.db')

const app = express()

app.use(express.json())

let database = null

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

// post

app.post('/login/', async (request, response) => {
  const {username, password} = request.body
  const checkUser = `
    SELECT * 
    FROM user
    WHERE username = '${username}';`
  const dbUser = await database.get(checkUser)

  if (dbUser === undefined) {
    response.status(400)
    response.body('Invalid user')
  } else {
    const isvalidPassword = await bcrypt.compare(password, dbUser.password)
    if (isvalidPassword === true) {
      const payload = {
        username: username,
      }
      const jwtToken = jsonwebtoken.sign(payload, 'MY_SECRET_TOKEN')
      response.send(jwtToken)
    } else {
      response.status(400)
      response.send('Invalid password')
    }
  }
})
