/*

*/

const mongoose = require('mongoose')

const config = require('../../config')

const WalletState = require('../../src/models/wallet-state')

async function getWalletState () {
  // Connect to the Mongo Database.
  mongoose.Promise = global.Promise
  mongoose.set('useCreateIndex', true) // Stop deprecation warning.
  await mongoose.connect(config.database, { useNewUrlParser: true })

  const walletState = await WalletState.find({})
  console.log(`walletState: ${JSON.stringify(walletState, null, 2)}`)

  mongoose.connection.close()
}
getWalletState()
