const Drop = require('../../models/drops')
const Campaign = require('../../models/campaigns')
const Map = require('../../lib/map')

let _this

class PlayController {
  constructor () {
    _this = this

    this.Drop = Drop
    this.Campaign = Campaign
    this.map = new Map()
  }

  /**
   * @api {post} /play Get directions for a player
   * @apiPermission public
   * @apiName GetDirections
   * @apiGroup Play
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X POST -d '{ "drop": { "message": "Test Drop", "lat": 47.5924342, "long": -122.3547189 } }' localhost:5001/drops
   *
   */
  async getDirections (ctx) {
    try {
      const playerInfo = ctx.request.body.playerInfo
      // console.log(`playerInfo: ${JSON.stringify(playerInfo, null, 2)}`)

      /*
       * ERROR HANDLERS
       *
       */
      // Required property
      if (!playerInfo.campaignId || typeof playerInfo.campaignId !== 'string') {
        throw new Error("Property 'campaignId' must be a string")
      }

      if (!playerInfo.lat) {
        throw new Error("Property 'lat' must be a number")
      }

      if (!playerInfo.lng) {
        throw new Error("Property 'lng' must be a number")
      }

      // Get the Campaign info from the DB.
      const campaign = await _this.Campaign.findById(playerInfo.campaignId)
      // console.log(`campaign: ${JSON.stringify(campaign, null, 2)}`)
      // console.log('campaign: ', campaign)

      // Get the Drops associated with the campaign.
      const drops = []
      for (let i = 0; i < campaign.drops.length; i++) {
        const thisDrop = await _this.Drop.findById(campaign.drops[i])
        // console.log(`thisDrop: ${JSON.stringify(thisDrop, null, 2)}`)

        drops.push(thisDrop)
      }

      // Convert the Drops into an array of coordinates.
      const points = []
      for (let i = 0; i < drops.length; i++) {
        const point = {
          latitude: drops[i].lat,
          longitude: drops[i].lng
        }

        points.push(point)
      }
      // console.log(`points: ${JSON.stringify(points, null, 2)}`)

      // Find the nearest Drop.
      const nearestDrop = _this.map.findNearest(
        playerInfo.lat,
        playerInfo.lng,
        points
      )
      // console.log('nearestDrop: ', nearestDrop)

      // Get the distance to the nearest drop.
      const distance = _this.map.getDistance(
        nearestDrop.latitude,
        nearestDrop.longitude,
        playerInfo.lat,
        playerInfo.lng
      )
      // console.log('distance: ', distance)

      // Get the direction to the nearest drop.
      const direction = _this.map.getHeading(
        nearestDrop.latitude,
        nearestDrop.longitude,
        playerInfo.lat,
        playerInfo.lng
      )
      // console.log('direction: ', direction)

      // Return the direction and info.
      ctx.body = {
        distance,
        direction
      }
    } catch (err) {
      console.error('Error in play/controller.js/getDirections()')
      // console.log(`err.message: ${err.message}`)
      // console.log('err: ', err)
      ctx.throw(422, err.message)
    }
  }
}

module.exports = PlayController
