const express = require('express')
const app = express()

const morgan = require('morgan')
const { default: helmet } = require('helmet')
const compression = require('compression')

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
checkOverload()
// Init routes
app.get('/', (req, res, next) => {
  const strCompress = 'Hello BinhJs'
  return res.status(200).json({
    message: 'API is running',
    metadata: strCompress.repeat(100000)
  })
})
// handle errors

module.exports = app
