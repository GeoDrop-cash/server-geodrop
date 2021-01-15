/*
  Integration tests for the payment.js library.
*/

const Payment = require('../../src/lib/payment')
const uut = new Payment()

describe('#Payment', () => {
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
