/*
  Integration tests for the payment.js library.
*/

const mongoose = require('mongoose')

const config = require('../../config')

const Payment = require('../../src/lib/payment')
const uut = new Payment()

describe('#Payment', () => {
  before(async () => {
    // Connect to the Mongo Database.
    mongoose.Promise = global.Promise
    mongoose.set('useCreateIndex', true) // Stop deprecation warning.
    await mongoose.connect(config.database, { useNewUrlParser: true })
  })

  after(async () => {
    mongoose.connection.close()
  })

  describe('#checkForPayment', () => {
    it('should do something', async () => {
      try {
        await uut.checkForPayment()
      } catch (err) {
        console.log(err)
      }
    })
  })
})
