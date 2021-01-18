const mongoose = require('mongoose')

// Force test environment
// make sure environment variable is set before this file gets called.
// see test script in package.json.
// process.env.KOA_ENV = 'test'
const config = require('../../config')

const WalletState = require('../../src/models/wallet-state')

async function deleteWalletState () {
  // Connect to the Mongo Database.
  mongoose.Promise = global.Promise
  mongoose.set('useCreateIndex', true) // Stop deprecation warning.
  await mongoose.connect(
    config.database,
    {
      useUnifiedTopology: true,
      useNewUrlParser: true
    }
  )

  // Get all the users in the DB.
  const walletState = await WalletState.find({})
  // console.log(`users: ${JSON.stringify(users, null, 2)}`)

  await walletState[0].remove()

  mongoose.connection.close()
}

deleteWalletState()
