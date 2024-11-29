const CheckoutService = require('../services/checkout.service')
const { performance } = require('perf_hooks')

async function simulateUserOrder(userId, products) {
  console.log(`[User ${userId}] Placing order...`)
  const shop_order_ids = [
    {
      shopId: 'shop1',
      item_products: products,
      totalAmount: products.reduce(
        (sum, product) => sum + product.price * product.quantity,
        0
      )
    }
  ]

  console.log({ shop_order_ids })

  try {
    const result = await CheckoutService.orderByUser({
      shop_order_ids,
      cartId: `CART-${userId}`,
      userId,
      user_address: { city: 'Sample City' },
      user_payment: { method: 'Credit Card' }
    })
    console.log(`[User ${userId}] Order result:`, result)
    return true
  } catch (error) {
    console.error(`[User ${userId}] Order failed:`, error.message)
    return false
  }
}

async function runConcurrentTest(numUsers, products) {
  const startTime = performance.now()

  const orderPromises = Array(numUsers)
    .fill()
    .map((_, index) => simulateUserOrder(`user${index + 1}`, products))

  console.log({ orderPromises })

  const results = await Promise.all(orderPromises)

  const endTime = performance.now()
  const duration = endTime - startTime

  const successfulOrders = results.filter((result) => result).length
  const failedOrders = numUsers - successfulOrders

  console.log(`\nTest completed in ${duration.toFixed(2)}ms`)
  console.log(`Successful orders: ${successfulOrders}`)
  console.log(`Failed orders: ${failedOrders}`)

  return { successfulOrders, failedOrders, duration }
}

async function runTest() {
  const numUsers = 1000
  const products = [
    { productId: 'product1', price: 10, quantity: 10 },
    { productId: 'product2', price: 20, quantity: 5 },
    { productId: 'product3', price: 30, quantity: 3 }
  ]
  console.log('Starting test with 10 concurrent users...')
  await runConcurrentTest(10, products)

  // console.log('\nStarting test with 50 concurrent users...')
  // await runConcurrentTest(numUsers, products)
}

runTest().catch(console.error)
