'use strict'

const mongoose = require('mongoose')
const { countConnect } = require('../helpers/check.connect')
countConnect()
const connectString =
  'mongodb+srv://binhphandev:jb0yKSsOrk6GUjFc@cluster0.orvki.mongodb.net/showDEV'

class Database {
  constructor() {
    this.connect()
  }

  connect(type = 'mongodb') {
    if (1 === 1) {
      mongoose.set('debug', true)
      mongoose.set('debug', { color: true })
    }
    mongoose
      .connect(connectString, {
        maxPoolSize: 100
      })
      .then((_) =>
        console.log(`Connected  Mongodb Successfully ${countConnect()}`)
      )
      .catch((err) => console.log(`Error Connecting`))
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database()
    }
    return Database.instance
  }
}

const instanceMongoDb = Database.getInstance()

module.exports = instanceMongoDb
