/*
  Integration tests for the slp.js library
*/

// Add a WIF that is funded with a few cents of BCH.
// bitcoincash:qqng506kt4rjvnm5t2g9at0zak0r6lqzgvfjd372f0
const WIF = 'L1VPLhFW1oxxYQ8cApp8i18QsxENx1fCXir4LrfuaQPPPBozLcwk'

const assert = require('chai').assert

const Slp = require('../../src/lib/slp')
const uut = new Slp()

describe('#slp.js', () => {
  describe('#createTokenType1', () => {
    it('should create a token', async () => {
      const tokenConfig = {
        name: 'test token',
        ticker: 'TEST',
        documentUrl: 'https://FullStack.cash',
        qty: 100,
        wif: WIF
      }

      const hex = await uut.createTokenType1(tokenConfig)
      // console.log('hex: ', hex)

      assert.isString(hex)
    })
  })
})
