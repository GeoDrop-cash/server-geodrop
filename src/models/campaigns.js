const mongoose = require('mongoose')

// const config = require('../../config')

const Campaign = new mongoose.Schema({
  drops: { type: Array },
  merchant: { type: String }
})

// export default mongoose.model('user', User)
module.exports = mongoose.model('campaign', Campaign)
