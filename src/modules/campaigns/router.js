// const VALIDATOR = require('../../middleware/validators')
// const validator = new VALIDATOR()

const CONTROLLER = require('./controller')
const controller = new CONTROLLER()

// export const baseUrl = '/users'
module.exports.baseUrl = '/campaigns'

module.exports.routes = [
  {
    method: 'POST',
    route: '/',
    handlers: [controller.createCampaign]
  },
  {
    method: 'GET',
    route: '/',
    handlers: [
      // validator.ensureUser,
      controller.getCampaigns
    ]
  },
  {
    method: 'GET',
    route: '/:id',
    handlers: [
      // validator.ensureUser,
      controller.getCampaign
    ]
  },
  {
    method: 'PUT',
    route: '/:id',
    handlers: [
      // validator.ensureTargetUserOrAdmin,
      controller.getCampaign,
      controller.updateCampaign
    ]
  },
  {
    method: 'DELETE',
    route: '/:id',
    handlers: [
      // validator.ensureTargetUserOrAdmin,
      controller.getCampaign,
      controller.deleteCampaign
    ]
  }
]
