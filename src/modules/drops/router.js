// const VALIDATOR = require('../../middleware/validators')
// const validator = new VALIDATOR()

const CONTROLLER = require('./controller')
const controller = new CONTROLLER()

// export const baseUrl = '/users'
module.exports.baseUrl = '/drops'

module.exports.routes = [
  {
    method: 'POST',
    route: '/',
    handlers: [controller.createDrop]
  },
  {
    method: 'GET',
    route: '/',
    handlers: [
      // validator.ensureUser,
      controller.getDrops
    ]
  },
  {
    method: 'GET',
    route: '/:id',
    handlers: [
      // validator.ensureUser,
      controller.getDrop
    ]
  },
  {
    method: 'PUT',
    route: '/:id',
    handlers: [
      // validator.ensureTargetUserOrAdmin,
      controller.getDrop,
      controller.updateDrop
    ]
  },
  {
    method: 'DELETE',
    route: '/:id',
    handlers: [
      // validator.ensureTargetUserOrAdmin,
      controller.getDrop,
      controller.deleteDrop
    ]
  }
]
