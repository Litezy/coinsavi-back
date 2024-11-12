const express = require('express')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5002
const http = require('http')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const server = http.createServer(app)

//configure server responses
app.use(express.json())
//enable file upload
app.use(fileUpload())
//frontend access to server
app.use(cors({
    origin:['http://localhost:5173','http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176']
}))


//serve static files in the public folder
app.use(express.static('public'))
app.use('/api/user', require('./routes/userRoutes'))
//server listening
server.listen(port, ()=>  console.log(`server running on http://localhost:${port}`))