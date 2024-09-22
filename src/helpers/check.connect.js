'use strict'

const mongoose = require('mongoose')
const os = require('os')
const process = require('process')
const _SECOND = 5000

// count connect
const countConnect = () => {
  const numConnection = mongoose.connections.length
  return numConnection
}

const checkOverload = () => {
  setInterval(() => {
    const numConnections = mongoose.connections.length
    const numCores = os.cpus().length
    const memoryUsage = process.memoryUsage().rss

    // Example maximum number of connections based on number of cores
    const maxConnections = numCores * 5

    console.log(`Activate connection: ${numConnections}`)
    console.log(`Memory usage: ${memoryUsage / 1024 / 1024} MB`)
    if (numConnections > maxConnections) {
      console.log('Connection overloading detected')
    }
  }, _SECOND) // Monitor every 5 seconds
}
module.exports = {
  countConnect,
  checkOverload
}
