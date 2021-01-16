const mongoose = require('mongoose')

// const config = require('../../config')

const Drop = new mongoose.Schema({
  lat: { type: Number, default: 47.5924342, required: true },
  lng: { type: Number, default: -122.3547189, required: true },
  message: { type: String, default: 'Test Drop' },
  campaign: { type: String, default: '' } // Campaign this Drop is associated with.
})

// export default mongoose.model('user', User)
module.exports = mongoose.model('drop', Drop)
