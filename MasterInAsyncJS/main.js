// ===================================
// 1. SYNCHRONOUS CODE EXAMPLE
// ===================================
// Executes line by line, blocking the main thread

function main() {
  console.log('First log')
  console.log('Second log')
  console.log('Third log')
  console.log('Fourth log')
}
main()
// Output: First, Second, Third, Fourth (in order)

// ===================================
// 2. ASYNCHRONOUS CODE WITH setTimeout
// ===================================
// Using timers to simulate async operations

function checkInventory() {
  setTimeout(() => {
    console.log('Checking the inventory')
  }, 2000)
}

function createOrder() {
  setTimeout(() => {
    console.log('Creating an order')
  }, 1000)
}

function chargePayment() {
  setTimeout(() => {
    console.log('Charging the payment')
  }, 1000)
}

function sendInvoice() {
  setTimeout(() => {
    console.log('Sending the invoice')
  }, 2000)
}

// Calling them directly - ORDER WILL BE WRONG!
checkInventory()
createOrder()
chargePayment()
sendInvoice()
console.log('Other request processing')

// ===================================
// 3. CALLBACKS TO FIX ORDER
// ===================================
// Using callbacks to maintain execution order

function checkInventoryCallback(callback) {
  setTimeout(() => {
    console.log('Checking the inventory')
    callback() // Call next function when done
  }, 2000)
}

function createOrderCallback(callback) {
  setTimeout(() => {
    console.log('Creating an order')
    callback()
  }, 2000)
}

function chargePaymentCallback(callback) {
  setTimeout(() => {
    console.log('Charging the payment')
    callback()
  }, 1000)
}

function sendInvoiceCallback(callback) {
  setTimeout(() => {
    console.log('Sending the invoice')
    callback()
  }, 2000)
}

// Using callbacks - correct order
checkInventoryCallback(() => {
  createOrderCallback(() => {
    chargePaymentCallback(() => {
      sendInvoiceCallback(() => {
        console.log('All done')
      })
    })
  })
})

// ===================================
// 4. CALLBACKS WITH ERROR HANDLING
// ===================================
// Passing errors as first parameter (Node.js convention)

function createOrderWithError(callback) {
  setTimeout(() => {
    const error = new Error('Order creation failed')
    callback(error) // Pass error to callback
  }, 2000)
}

function chargePaymentWithData(callback) {
  setTimeout(() => {
    const chargedAmount = 100
    callback(null, chargedAmount) // null = no error, then data
  }, 1000)
}

// Handling errors in callbacks
checkInventoryCallback((error) => {
  if (error) {
    console.log('Error:', error)
    return
  }

  createOrderWithError((error) => {
    if (error) {
      console.log('Handling the error:', error.message)
      return
    }

    chargePaymentWithData((error, chargedAmount) => {
      if (error) {
        console.log('Handling the error')
        return
      }
      console.log('Charged amount:', chargedAmount)
    })
  })
})

// ===================================
// 5. PROMISES - Basic Structure
// ===================================
// Promises provide a cleaner way to handle async operations

function checkInventoryPromise() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('Checking the inventory')
      resolve() // Success
      // reject(new Error("Failed")); // Use this for errors
    }, 2000)
  })
}

function createOrderPromise() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('Creating an order')
      resolve()
    }, 2000)
  })
}

function chargePaymentPromise() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('Charging the payment')
      resolve()
    }, 1000)
  })
}

function sendInvoicePromise() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('Sending the invoice')
      resolve()
    }, 2000)
  })
}

// ===================================
// 6. PROMISES WITH .then() CHAINING
// ===================================
// Chaining promises to maintain order

checkInventoryPromise()
  .then(() => {
    console.log('Inventory done')
    return createOrderPromise()
  })
  .then(() => {
    return chargePaymentPromise()
  })
  .then(() => {
    return sendInvoicePromise()
  })
  .then(() => {
    console.log('All done')
  })

// Cleaner syntax - pass function reference directly
checkInventoryPromise()
  .then(createOrderPromise)
  .then(chargePaymentPromise)
  .then(sendInvoicePromise)
  .then(() => console.log('All done'))

// ===================================
// 7. PROMISE ERROR HANDLING
// ===================================
// Using .catch() to handle errors

function checkInventoryWithError() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('Checking the inventory')
      reject(new Error('Failed to check inventory'))
    }, 2000)
  })
}

// Catch errors at the end of chain
checkInventoryWithError()
  .then(createOrderPromise)
  .then(chargePaymentPromise)
  .then(sendInvoicePromise)
  .catch((error) => {
    console.log('Error:', error.message)
  })

// Individual error handling per promise
checkInventoryWithError()
  .catch((error) => {
    console.log('Inventory error:', error.message)
  })
  .then(createOrderPromise)
  .catch((error) => {
    console.log('Order error:', error.message)
  })

// ===================================
// 8. PROMISES WITH DATA PASSING
// ===================================
// Passing data through resolve()

function checkInventoryWithData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const inStock = 45
      console.log('Checking the inventory')
      resolve(inStock) // Pass data via resolve
    }, 2000)
  })
}

checkInventoryWithData()
  .then((inStock) => {
    console.log('In stock:', inStock)
    return createOrderPromise()
  })
  .then(() => {
    console.log('All done')
  })

// ===================================
// 9. ASYNC/AWAIT - Modern Syntax
// ===================================
// Cleaner way to work with promises

async function processOrder() {
  try {
    await checkInventoryPromise()
    await createOrderPromise()
    await chargePaymentPromise()
    await sendInvoicePromise()
    console.log('All done')
  } catch (error) {
    console.log('Error:', error.message)
  }
}

processOrder()
console.log('Other request processing') // Won't be blocked!

// ===================================
// 10. ASYNC/AWAIT WITH DATA
// ===================================
// Receiving data from promises with await

async function processOrderWithData() {
  try {
    const inStock = await checkInventoryWithData()
    console.log('Stock available:', inStock)

    await createOrderPromise()
    await chargePaymentPromise()
    await sendInvoicePromise()
  } catch (error) {
    console.log('Error:', error)
  }
}

// ===================================
// 11. INDIVIDUAL ERROR HANDLING
// ===================================
// Separate try-catch for each operation

async function processOrderIndividualErrors() {
  try {
    await checkInventoryPromise()
  } catch (error) {
    console.log('Inventory error:', error.message)
  }

  try {
    await createOrderPromise()
  } catch (error) {
    console.log('Order error:', error.message)
  }

  try {
    await chargePaymentPromise()
  } catch (error) {
    console.log('Payment error:', error.message)
  }

  try {
    await sendInvoicePromise()
  } catch (error) {
    console.log('Invoice error:', error.message)
  }
}

// ===================================
// KEY CONCEPTS SUMMARY
// ===================================

/*
1. SYNCHRONOUS CODE:
   - Executes line by line
   - Blocks the main thread
   - Simple but can freeze the application

2. ASYNCHRONOUS CODE:
   - Doesn't block the main thread
   - Uses callbacks, promises, or async/await
   - Better for I/O operations (network, database, file system)

3. CALLBACKS:
   - Pass function as argument
   - Leads to "callback hell" when nested
   - Error as first parameter (Node.js convention)

4. PROMISES:
   - Three states: pending, fulfilled (resolved), rejected
   - Use .then() for success, .catch() for errors
   - Can chain multiple promises
   - Cleaner than callbacks

5. ASYNC/AWAIT:
   - Syntactic sugar over promises
   - Makes async code look synchronous
   - Use try-catch for error handling
   - Must be inside async function
   - RECOMMENDED APPROACH for modern JavaScript

6. MAIN THREAD:
   - JavaScript is single-threaded
   - await moves operations off main thread
   - Other requests can process while waiting
   - Never block the main thread for long operations
*/
