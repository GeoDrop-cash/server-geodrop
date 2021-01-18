/*
  Display all the Campaigns in the database.
*/

const mongoose = require('mongoose')

const config = require('../../config')

const Campaign = require('../../src/models/campaigns')

async function getCampaigns () {
  // Connect to the Mongo Database.
  mongoose.Promise = global.Promise
  mongoose.set('useCreateIndex', true) // Stop deprecation warning.
  await mongoose.connect(config.database, { useNewUrlParser: true })

  const campaigns = await Campaign.find({})
  console.log(`campaigns: ${JSON.stringify(campaigns, null, 2)}`)

  mongoose.connection.close()
}
getCampaigns()
