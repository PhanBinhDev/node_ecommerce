const app = require('./src/app')

const PORT = 3066
const server = app.listen(PORT, () => {
  console.log(`Backend eCommerce is running on port ${PORT}`)
})

process.on('SIGINT', () => {
  server.close(() => {
    console.log('Backend eCommerce gracefully shut down')
  })
})
