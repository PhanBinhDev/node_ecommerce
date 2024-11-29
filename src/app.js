const express = require('express')
const app = express()

require('dotenv').config()
const morgan = require('morgan')
const { default: helmet } = require('helmet')
const compression = require('compression')
require('module-alias/register')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// Init middlewares
// morgan
app.use(morgan('dev'))
// helmet
app.use(helmet())
// compression
app.use(compression())

// Init database
require('./dbs/init.mongodb')

const { checkOverload } = require('./helpers/check.connect')
// checkOverload()
// Init routes
app.use('/v1/api', require('./routes/index'))

// handle errors
app.use((req, res, next) => {
  const error = new Error('Not Found')
  error.status = 404
  next(error)
})

app.use((error, req, res, next) => {
  const statusCode = error.status || 500

  return res.status(statusCode).json({
    status: 'error',
    code: statusCode,
    stack: error.stack,
    message: error.message || 'Internal Server Error'
  })
})

module.exports = app
