/*
  Display all the Merchants in the database.
*/

const mongoose = require('mongoose')

const config = require('../../config')

const Merchant = require('../../src/models/merchants')

async function getMerchants () {
  // Connect to the Mongo Database.
  mongoose.Promise = global.Promise
  mongoose.set('useCreateIndex', true) // Stop deprecation warning.
  await mongoose.connect(config.database, { useNewUrlParser: true })

  const merchants = await Merchant.find({})
  console.log(`merchants: ${JSON.stringify(merchants, null, 2)}`)

  mongoose.connection.close()
}
getMerchants()
