const mongoose = require('mongoose')

// const config = require('../../config')

const Campaign = new mongoose.Schema({
  drops: { type: Array },
  merchant: { type: String },
  // A campaign is assigned a BCH address from the servers HD wallet.
  // Paying the address triggers the generation of the tokens, and
  // starts the campaign.
  bchAddr: { type: String },
  hasBeenPaid: { type: Boolean, default: false }
})

// Campaign.methods.getAddress

// export default mongoose.model('user', User)
module.exports = mongoose.model('campaign', Campaign)
