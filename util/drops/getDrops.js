/*
  Display all the Drops in the database.
*/

const mongoose = require('mongoose')

const config = require('../../config')

const Drop = require('../../src/models/drops')

async function getDrops () {
  // Connect to the Mongo Database.
  mongoose.Promise = global.Promise
  mongoose.set('useCreateIndex', true) // Stop deprecation warning.
  await mongoose.connect(config.database, { useNewUrlParser: true })

  const drops = await Drop.find({})
  console.log(`drops: ${JSON.stringify(drops, null, 2)}`)

  mongoose.connection.close()
}
getDrops()
