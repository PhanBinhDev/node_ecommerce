'use strict'

const mongoose = require('mongoose')

const connectString = 'mongodb://localhost:27017/showDEV'

mongoose
  .connect(connectString)
  .then((_) => console.log(`Connected  Mongodb Successfully`))
  .catch((err) => console.log(`Error Connecting`))

// Dev
if (1 === 0) {
  mongoose.set('debug', true)
  mongoose.set('debug', { color: true })
}

module.exports = mongoose
