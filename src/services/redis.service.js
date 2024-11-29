'use strict'

const Redis = require('ioredis')
const {
  reservationInventory
} = require('../models/repositories/inventory.repo')
const redisClient = new Redis(process.env.DEV_REDIS_ENDPOINT)

const acquireLock = async ({ product_id, quantity, cartId }) => {
  const lockKey = `lock_v1:${product_id}:${cartId}`
  const maxRetries = 10
  const expireTime = 3000 // seconds lock
  let retries = 0
  while (retries < maxRetries) {
    try {
      // Sử dụng set với NX và PX options
      const result = await redisClient.set(lockKey, '1', 'NX', 'PX', expireTime)

      if (result === 'OK') {
        // Lock acquired successfully
        const isReservation = await reservationInventory({
          product_id,
          quantity,
          cartId
        })

        if (isReservation) {
          return lockKey
        }
        // If reservation failed, release the lock
        await redisClient.del(lockKey)
        return null
      } else {
        // Lock not acquired, wait and retry
        await new Promise((resolve) => setTimeout(resolve, 50))
        retries++
      }
    } catch (error) {
      console.error('Error acquiring lock:', error)
      return null
    }
  }
}

const releaseLock = async (lockKey) => {
  try {
    return await redisCLient.del(lockKey)
  } catch (error) {
    console.error('Error releasing lock:', error)
    return 0
  }
}

module.exports = {
  acquireLock,
  releaseLock
}
