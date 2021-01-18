const mongoose = require('mongoose')

const config = require('../../config')
const WalletState = require('./wallet-state')

const BCHJS = require('@psf/bch-js')
const bchjs = new BCHJS()

const Campaign = new mongoose.Schema({
  drops: { type: Array },
  merchant: { type: String },
  // A campaign is assigned a BCH address from the servers HD wallet.
  // Paying the address triggers the generation of the tokens, and
  // starts the campaign.
  bchAddr: { type: String },
  hdIndex: { type: Number },
  satsToPay: { type: Number, required: true }, // Minimum in sats the merchant needs to pay.
  hasBeenPaid: { type: Boolean, default: false },
  blockHeightPaid: { type: Number, default: 0 },
  expiration: { type: String },
  isActive: { type: Boolean, default: false },

  // This property marked as true when the campaign has been closed down and all
  // funds sent to eatBCH.
  hasBeenSwept: { type: Boolean, default: false },

  // Map data
  lat: { type: Number, default: 47.5924342 },
  long: { type: Number, default: -122.3547189 },
  radius: { type: Number, default: 1500 }, // meters

  // token data
  tokenName: { type: String },
  tokenTicker: { type: String },
  tokenUrl: { type: String },
  tokenQty: { type: Number },
  tokenId: { type: String }
})

// Query the wallet-state model to generate a new address from the HD wallet.
Campaign.methods.getAddress = async function getAddress () {
  try {
    // Get the wallet state from the database.
    let walletState = await WalletState.find({})
    walletState = walletState[0]

    // get the mnemonic
    const mnemonic = config.mnemonic

    // get the index for the next address, from the wallet state.
    const addrIndex = walletState.nextAddress
    console.log(`hd index: ${addrIndex}`)

    // generate the address.
    const rootSeed = await bchjs.Mnemonic.toSeed(mnemonic)
    const masterHDNode = bchjs.HDNode.fromSeed(rootSeed)
    const childNode = masterHDNode.derivePath(`m/44'/245'/0'/0/${addrIndex}`)
    const cashAddress = bchjs.HDNode.toCashAddress(childNode)

    // increase the hd index in the wallet state model
    walletState.nextAddress++

    // save the model
    await walletState.save()

    // return the address
    return { cashAddress, addrIndex }
  } catch (err) {
    console.error('Error in models/campaigns.js/getAddress()')
    throw err
  }
}

// Returns a JavaScript Date object representing two weeks from the current time.
Campaign.methods.generateExpiration = function generateExpiration () {
  try {
    const now = new Date()

    const TWO_WEEKS = 60000 * 60 * 24 * 14

    const twoWeeksFromNow = now.getTime() + TWO_WEEKS

    const retDate = new Date(twoWeeksFromNow)

    return retDate
  } catch (err) {
    console.error('Error in models/campaigns.js/generateExpiration()')
    throw err
  }
}

// export default mongoose.model('user', User)
module.exports = mongoose.model('campaign', Campaign)
