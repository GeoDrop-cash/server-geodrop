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

  describe('#sendToken', () => {
    it('should send a token', async () => {
      const sendConfig = {
        playerAddr: 'bitcoincash:qqng506kt4rjvnm5t2g9at0zak0r6lqzgvfjd372f0',
        tokenId: '8f338ca4b477691a1915231d85d0d22cf024d5c8198befb1a7b9a132530b98c3',
        wif: WIF
      }

      const hex = await uut.sendToken(sendConfig)
      console.log('hex: ', hex)
    })
  })
})
