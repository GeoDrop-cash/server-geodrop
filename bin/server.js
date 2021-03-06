// npm libraries
const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const convert = require('koa-convert')
const logger = require('koa-logger')
const mongoose = require('mongoose')
const session = require('koa-generic-session')
const passport = require('koa-passport')
const mount = require('koa-mount')
const serve = require('koa-static')
const cors = require('kcors')

// Local libraries
const config = require('../config') // this first.

const WalletState = require('../src/models/wallet-state')

const AdminLib = require('../src/lib/admin')
const adminLib = new AdminLib()

const errorMiddleware = require('../src/middleware')
const wlogger = require('../src/lib/wlogger')

const Payment = require('../src/lib/payment')
const paymentLib = new Payment()

const EatBch = require('../src/lib/eat-bch')
const eatBch = new EatBch()

async function startServer () {
  // Create a Koa instance.
  const app = new Koa()
  app.keys = [config.session]

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

  // MIDDLEWARE START

  app.use(convert(logger()))
  app.use(bodyParser())
  app.use(session())
  app.use(errorMiddleware())

  // Used to generate the docs.
  app.use(mount('/', serve(`${process.cwd()}/docs`)))

  // Mount the page for displaying logs.
  app.use(mount('/logs', serve(`${process.cwd()}/config/logs`)))

  // User Authentication
  require('../config/passport')
  app.use(passport.initialize())
  app.use(passport.session())

  // Custom Middleware Modules
  const modules = require('../src/modules')
  modules(app)

  // Enable CORS for testing
  // THIS IS A SECURITY RISK. COMMENT OUT FOR PRODUCTION
  app.use(cors({ origin: '*' }))

  // MIDDLEWARE END

  console.log(`Running server in environment: ${config.env}`)
  wlogger.info(`Running server in environment: ${config.env}`)

  await app.listen(config.port)
  console.log(`Server started on ${config.port}`)

  // Create the system admin user.
  const success = await adminLib.createSystemUser()
  if (success) console.log('System admin user created.')

  // Create a new wallet database model if doesn't yet exist (new install).
  createWallet()

  // Periodically scan for new payments.
  setInterval(function () {
    try {
      paymentLib.processPayments()
    } catch (err) {
      console.error('Error trying to process payments!')
    }
  }, 60000 * 2) // two minutes
  // }, 10000)

  // Peridocally check the campaigns and close down old ones.
  setInterval(await function () {
    try {
      console.log('Scanning for expired campaigns.')
      eatBch.scanForFinishedCampaigns()
    } catch (err) {
      console.error('Error trying to clean up dead campaigns: ', err)
    }
  }, 60000 * 60) // Once per hour

  return app
}
// startServer()

// This function is only run once on a new install. If an instance of the wallet
// model exists, it simply exits.
async function createWallet () {
  try {
    let walletState = await WalletState.find({})

    // If there is already an insance of the model, exit.
    if (walletState.length > 0) {
      console.log(
        `Wallet-State database model already exists. Next address index: ${
          walletState[0].nextAddress
        }`
      )
      // console.log('walletState: ', walletState)
      return false
    }

    // New installation. Create a wallet-state model.
    walletState = new WalletState({})
    walletState.save()

    console.log('New installation detected. Created new wallet-state model.')
    return true
  } catch (err) {
    console.error('Error in server.js/createWallet()')
    throw err
  }
}

// export default app
// module.exports = app
module.exports = {
  startServer
}
