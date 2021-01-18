// const VALIDATOR = require('../../middleware/validators')
// const validator = new VALIDATOR()

const CONTROLLER = require('./controller')
const controller = new CONTROLLER()

// export const baseUrl = '/users'
module.exports.baseUrl = '/play'

module.exports.routes = [
  {
    method: 'POST',
    route: '/directions',
    handlers: [controller.getDirections]
  },
  {
    method: 'POST',
    route: '/claim',
    handlers: [controller.claimToken]
  }
]
