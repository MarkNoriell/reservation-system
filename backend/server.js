const express = require('express')
const cors = require('cors')
const app = express()

const port = 3000

const api = require('./router/index.js')

app.use(cors())
app.use(express.json())
app.use("/api",api)

app.listen(port,() => {
    console.log(`Server listening on port ${port}`)
})