/*
  This library handles payment processing.
*/

// public npm libraries
const BCHJS = require('@psf/bch-js')

// Local libraries
const Campaign = require('../models/campaigns')

class Payment {
  constructor (payConfig) {
    this.bchjs = new BCHJS()
    this.Campaign = Campaign

    this.blah = 4
  }

  // Scans the database for unpaid campaigns and checks to see if they've been
  // funded. Returns an array of IDs of the campaigns that have been funded.
  // Returns an empty array if no funded campaigns are found.
  async checkForPayment () {
    try {
      // Get any campaigns with hasBeenPaid flag set to false.
      const campaigns = await this.Campaign.find({ hasBeenPaid: false })

      // Exit if there are no unpaid campaigns.
      if (!campaigns.length) return false

      const fundedCampaigns = []

      // Loop through each of those campaigns.
      for (let i = 0; i < campaigns.length; i++) {
        const thisCampaign = campaigns[i]
        console.log(`thisCampaign: ${JSON.stringify(thisCampaign, null, 2)}`)

        // Query the balance of the BCH address associated with the campaign.
        const balanceData = await this.bchjs.Electrumx.balance(
          thisCampaign.bchAddr
        )
        const balance =
          balanceData.balance.confirmed + balanceData.balance.unconfirmed

        // If a balance is greater than satsToPay, return the campaign ID.
        if (balance) fundedCampaigns.push(thisCampaign._id)
      }

      return fundedCampaigns
    } catch (err) {
      console.error('Error in checkForPayment()')
      throw err
    }
  }
}

module.exports = Payment
