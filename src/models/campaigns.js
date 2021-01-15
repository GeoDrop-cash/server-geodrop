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
  satsToPay: { type: Number }, // Minimum in sats the merchant needs to pay.
  hasBeenPaid: { type: Boolean, default: false },
  blockHeightPaid: { type: Number, default: 0 },
  lat: { type: Number, default: 47.5924342 },
  long: { type: Number, default: -122.3547189 },
  radius: { type: Number, default: 1500 } // meters
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

// export default mongoose.model('user', User)
module.exports = mongoose.model('campaign', Campaign)
