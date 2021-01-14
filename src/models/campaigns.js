const mongoose = require('mongoose')

// const config = require('../../config')
const WalletState = require('./wallet-state')

const Campaign = new mongoose.Schema({
  drops: { type: Array },
  merchant: { type: String },
  // A campaign is assigned a BCH address from the servers HD wallet.
  // Paying the address triggers the generation of the tokens, and
  // starts the campaign.
  bchAddr: { type: String },
  hasBeenPaid: { type: Boolean, default: false }
})

// Query the wallet-state model to generate a new address from the HD wallet.
Campaign.methods.getAddress = async function getAddress () {
  try {
    let walletState = await WalletState.find({})
    walletState = walletState[0]

    // get the mnemonic
    // get the index for the next address, from the wallet state.
    console.log(`hd index: ${walletState.nextAddress}`)
    // generate the address.
    // increase the hd index in the wallet state model
    // save the model
    // return the address
  } catch (err) {
    console.error('Error in models/campaigns.js/getAddress()')
  }
}

// export default mongoose.model('user', User)
module.exports = mongoose.model('campaign', Campaign)
