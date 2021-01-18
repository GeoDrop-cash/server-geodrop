/*
  This library contains code for closing down Campaigns and sweeping funds
  to eatBCH.org.
*/

// Public npm libraries
const BCHJS = require('@psf/bch-js')
const BchUtil = require('bch-util')

// Local libraries
const Payment = require('./payment')
const Campaign = require('../models/campaigns')
const Slp = require('./slp')

// This address was retrieved from the eatBCH.org website.
const EATBCH_ADDR = 'bitcoincash:pp8skudq3x5hzw8ew7vzsw8tn4k8wxsqsv0lt0mf3g'

class EatBch {
  constructor (configEatBch) {
    // Encapsulate dependencies for easier testing.
    this.bchjs = new BCHJS()
    this.bchUtil = new BchUtil({ bchjs: this.bchjs })
    this.payment = new Payment()
    this.Campaign = Campaign
    this.slp = new Slp()
  }

  // Transfers all BCH held by a campaign BCH address and sends it to eatBCH.
  // If there are any tokens, they will be burned and converted to BCH.
  async sweepCampaign (campaignId) {
    try {
      // Get the campaign model
      const campaign = await this.Campaign.findById(campaignId)
      // console.log(`campaign: ${JSON.stringify(campaign, null, 2)}`)

      // Generate the WIF private key for the campaign.
      const wif = await this.payment.getWif(campaign.hdIndex)

      const keyPair = this.bchjs.ECPair.fromWIF(wif)
      const cashAddress = this.bchjs.ECPair.toCashAddress(keyPair)

      // Get the UTXOs associated with the cash address.
      const data = await this.bchjs.Electrumx.utxo(cashAddress)
      const utxos = data.utxos

      // Throw an error if there are no UTXOs to pay for the transaction.
      if (!utxos.length) {
        throw new Error('No UTXOs available. Exiting.')
      }

      const transactionBuilder = new this.bchjs.TransactionBuilder()

      let sendAmount = 0
      const inputs = []

      // Loop through each UTXO assigned to this address.
      for (let i = 0; i < utxos.length; i++) {
        const thisUtxo = utxos[i]

        inputs.push(thisUtxo)

        sendAmount += thisUtxo.value

        // ..Add the utxo as an input to the transaction.
        transactionBuilder.addInput(thisUtxo.tx_hash, thisUtxo.tx_pos)
      }

      // get byte count to calculate fee. paying 1.2 sat/byte
      const byteCount = this.bchjs.BitcoinCash.getByteCount(
        { P2PKH: inputs.length },
        { P2PKH: 1 }
      )

      const satoshisPerByte = 1.0
      const txFee = Math.ceil(satoshisPerByte * byteCount)

      // Exit if the transaction costs too much to send.
      if (sendAmount - txFee < 546) {
        throw new Error(
          "Transaction fee costs more combined UTXOs. Can't send transaction."
        )
      }

      // add output w/ address and amount to send
      transactionBuilder.addOutput(EATBCH_ADDR, sendAmount - txFee)

      // sign w/ HDNode
      let redeemScript
      inputs.forEach((input, index) => {
        transactionBuilder.sign(
          index,
          keyPair,
          redeemScript,
          transactionBuilder.hashTypes.SIGHASH_ALL,
          input.value
        )
      })

      // build tx
      const tx = transactionBuilder.build()
      // output rawhex
      const hex = tx.toHex()

      return hex
    } catch (err) {
      console.error('Error in slp.js/sendToken()')
      throw err
    }
  }

  // Called periodically to scan the database for finished campaigns. These are
  // campaigns that are older than the experation date, or have the following
  // properties:
  //   hasBeenPaid: true
  //   isActive: false
  // If a campaign is found that meets the criteria, sweepCampaign will be
  // called to sweep the funds to eatBCH.
  async scanForFinishedCampaigns () {
    try {
      // Get all the campaigns in the database.
      const campaigns = await this.Campaign.find({ hasBeenSwept: false })

      // Generate a number that represents the current time.
      let now = new Date()
      now = now.getTime()

      for (let i = 0; i < campaigns.length; i++) {
        const thisCampaign = campaigns[i]

        // Query the balance of the BCH address associated with the campaign.
        const balanceData = await this.bchjs.Electrumx.balance(
          thisCampaign.bchAddr
        )
        const balance =
          balanceData.balance.confirmed + balanceData.balance.unconfirmed

        // All Drops have been collected for this campaign.
        if (
          thisCampaign.hasBeenPaid === true &&
          thisCampaign.isActive === false
        ) {
          if (balance > 1000) {
            // If the address has a balance.
            try {
              console.log(`Closing down campaign ${thisCampaign._id}`)

              // Sweep any funds to eatBCH
              const hex = await this.sweepCampaign(thisCampaign._id)
              const txid = await this.slp.broadcastTx(hex)
              console.log(`Funds swept to eatBCH. TXID: ${txid}`)
            } catch (err) {
              /* exit quietly */
            }
          }

          // Mark the campaign as closed.
          thisCampaign.hasBeenSwept = true
          await thisCampaign.save()

          continue
        }

        let expirationDate = new Date(thisCampaign.expiration)
        expirationDate = expirationDate.getTime()

        // If the campaign has expired.
        if (expirationDate < now) {
          if (balance > 1000) {
            try {
              console.log(`Campaign ${thisCampaign._id} has expired. Sweeping funds.`)

              // Sweep any funds to eatBCH
              const hex = await this.sweepCampaign(thisCampaign._id)
              const txid = await this.slp.broadcastTx(hex)
              console.log(`Funds swept to eatBCH. TXID: ${txid}`)
            } catch (err) {
              /* exit quietly */
            }
          }

          thisCampaign.isActive = false

          // Mark the campaign as closed.
          thisCampaign.hasBeenSwept = true
          await thisCampaign.save()

          continue
        }
      }
    } catch (err) {
      console.error('Error in scanForFinishedCampaigns: ', err)
    }
  }
}

module.exports = EatBch
