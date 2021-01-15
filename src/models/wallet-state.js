/*
  This is a special database model. Unlike other models, there is intended to
  only be one instance of this model. That instance tracks the state of the
  wallet.
*/

const mongoose = require('mongoose')

// const config = require('../../config')

const WalletState = new mongoose.Schema({
  network: { type: String, default: 'mainnet' },
  derivation: { type: Number, default: 245 },
  nextAddress: { type: Number, default: 0 },

  // Stores the IDs of campaign models. The number of elements in this array
  // should equal the value of the nextAddress property.
  campaigns: { type: Array }
})

// export default mongoose.model('user', User)
module.exports = mongoose.model('walletState', WalletState)
