const mongoose = require('mongoose')

// const config = require('../../config')

const Merchant = new mongoose.Schema({
  lat: { type: Number, default: 47.5924342 },
  long: { type: Number, default: -122.3547189 },
  address: { type: String },
  phone: { type: String },
  name: { type: String }
})

// export default mongoose.model('user', User)
module.exports = mongoose.model('merchant', Merchant)
