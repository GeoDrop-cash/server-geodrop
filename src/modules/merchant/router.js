// const VALIDATOR = require('../../middleware/validators')
// const validator = new VALIDATOR()

const CONTROLLER = require('./controller')
const controller = new CONTROLLER()

// export const baseUrl = '/users'
module.exports.baseUrl = '/merchants'

module.exports.routes = [
  {
    method: 'POST',
    route: '/',
    handlers: [controller.createMerchant]
  },
  {
    method: 'GET',
    route: '/',
    handlers: [
      // validator.ensureUser,
      controller.getMerchants
    ]
  },
  {
    method: 'GET',
    route: '/:id',
    handlers: [
      // validator.ensureUser,
      controller.getMerchant
    ]
  },
  {
    method: 'PUT',
    route: '/:id',
    handlers: [
      // validator.ensureTargetUserOrAdmin,
      controller.getMerchant,
      controller.updateMerchant
    ]
  },
  {
    method: 'DELETE',
    route: '/:id',
    handlers: [
      // validator.ensureTargetUserOrAdmin,
      controller.getMerchant,
      controller.deleteMerchant
    ]
  }
]
