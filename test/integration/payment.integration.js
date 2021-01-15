/*
  Integration tests for the payment.js library.
*/

const assert = require('chai').assert
const mongoose = require('mongoose')

const config = require('../../config')

const Payment = require('../../src/lib/payment')
const uut = new Payment()

describe('#Payment', () => {
  before(async () => {
    // Connect to the Mongo Database.
    mongoose.Promise = global.Promise
    mongoose.set('useCreateIndex', true) // Stop deprecation warning.
    await mongoose.connect(config.database, { useUnifiedTopology: true, useNewUrlParser: true })
  })

  after(async () => {
    mongoose.connection.close()
  })

  describe('#checkForPayment', () => {
    it('should return an array', async () => {
      try {
        const fundedCampaigns = await uut.checkForPayment()
        console.log(`fundedCampaigns: ${JSON.stringify(fundedCampaigns, null, 2)}`)

        assert.isArray(fundedCampaigns)
      } catch (err) {
        console.log(err)
      }
    })
  })
})
