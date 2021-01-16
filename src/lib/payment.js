/*
  This library handles payment processing.
*/

// public npm libraries
const BCHJS = require('@psf/bch-js')

// Local libraries
const Campaign = require('../models/campaigns')
const Slp = require('./slp')
const config = require('../../config')

class Payment {
  constructor (payConfig) {
    // Encapsulate dependencies for easier mocking.
    this.bchjs = new BCHJS()
    this.Campaign = Campaign
    this.slp = new Slp()
    this.config = config

    this.blah = 4
  }

  // Scans the database for unpaid campaigns and checks to see if they've been
  // funded. Returns an array of IDs of the campaigns that have been funded.
  // Returns an empty array if no funded campaigns are found.
  async checkForPayment () {
    try {
      // Get any campaigns with hasBeenPaid flag set to false.
      const campaigns = await this.Campaign.find({ hasBeenPaid: false })
      // const campaigns = await this.Campaign.find({})

      // Exit if there are no unpaid campaigns.
      if (!campaigns.length) return false

      const fundedCampaigns = []

      // Loop through each of those campaigns.
      for (let i = 0; i < campaigns.length; i++) {
        const thisCampaign = campaigns[i]
        // console.log(`thisCampaign: ${JSON.stringify(thisCampaign, null, 2)}`)

        // Query the balance of the BCH address associated with the campaign.
        const balanceData = await this.bchjs.Electrumx.balance(
          thisCampaign.bchAddr
        )
        const balance =
          balanceData.balance.confirmed + balanceData.balance.unconfirmed

        // If a balance is greater than satsToPay, return the campaign ID.
        // if (balance >= thisCampaign.satsToPay) fundedCampaigns.push(thisCampaign._id)
        // For debugging
        if (balance >= 3000) fundedCampaigns.push(thisCampaign._id)
      }

      return fundedCampaigns
    } catch (err) {
      console.error('Error in checkForPayment()')
      throw err
    }
  }

  // This function is called periodically by a timer in the bin/server.js file
  // when the the server starts.
  async processPayments () {
    try {
      const fundedCampaigns = await this.checkForPayment()

      if (fundedCampaigns.length === 0) {
        console.log('No new payments detected.')
        return false
      }

      for (let i = 0; i < fundedCampaigns.length; i++) {
        console.log(`Campaign ${fundedCampaigns[i]} has been funded.`)

        const campaign = await this.Campaign.findById(fundedCampaigns[i])
        // console.log(`campaign: ${JSON.stringify(campaign, null, 2)}`)

        // Record the current block height.
        campaign.blockHeightPaid = await this.bchjs.Blockchain.getBlockCount()

        // Mark the campaign as paid.
        campaign.hasBeenPaid = true

        await campaign.save()

        // Generate a WIF private key for the address assigned to the campaign.
        const wif = await this.getWif(campaign.hdIndex)

        // Generate the tokens
        const tokenConfig = {
          name: campaign.tokenName,
          ticker: campaign.tokenTicker,
          documentUrl: campaign.tokenUrl,
          qty: campaign.tokenQty,
          wif: wif
        }
        const hex = await this.slp.createTokenType1(tokenConfig)

        const txid = await this.slp.broadcastTx(hex)
        console.log(`${campaign.tokenTicker} token created. TXID: ${txid}`)

        // Send the tokens to the address of the campaign?
      }
    } catch (err) {
      console.error('Error in processPayments()')
      throw err
    }
  }

  // Get the WIF private key for a given HD index.
  async getWif (hdIndex) {
    try {
      // TODO: throw an error if hdIndex is not an integer.

      // get the mnemonic
      const mnemonic = config.mnemonic

      // generate the wif
      const rootSeed = await this.bchjs.Mnemonic.toSeed(mnemonic)
      const masterHDNode = this.bchjs.HDNode.fromSeed(rootSeed)
      const childNode = masterHDNode.derivePath(`m/44'/245'/0'/0/${hdIndex}`)
      const wif = this.bchjs.HDNode.toWIF(childNode)
      // console.log(`wif: ${JSON.stringify(wif, null, 2)}`)

      return wif
    } catch (err) {
      console.error('Error in payment.js/getWif()')
      throw err
    }
  }
}

module.exports = Payment
