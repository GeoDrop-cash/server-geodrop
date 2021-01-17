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
   * @api {post} /play/directions Get directions for a player
   * @apiPermission public
   * @apiName GetDirections
   * @apiGroup Play
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X POST -d '{ "playerInfo": { "campaignId": "6003740f8683ce20a734887a", "lat": 47.5924342, "lng": -122.3547189 } }' localhost:5001/play/directions
   *
   */
  async getDirections (ctx) {
    try {
      const playerInfo = ctx.request.body.playerInfo
      console.log(`playerInfo: ${JSON.stringify(playerInfo, null, 2)}`)

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

      // call _getDirections()
      const info = await _this._getDirections(
        playerInfo.campaignId,
        playerInfo.lat,
        playerInfo.lng
      )

      // Return the direction and info.
      ctx.body = info
    } catch (err) {
      console.error('Error in play/controller.js/getDirections()')
      // console.log(`err.message: ${err.message}`)
      // console.log('err: ', err)
      ctx.throw(422, err.message)
    }
  }

  // This is a private function that is called by multiple controllers in this
  // library. It returns an object with distance and direction.
  async _getDirections (campaignId, playerLat, playerLng) {
    try {
      // Get the Campaign info from the DB.
      const campaign = await _this.Campaign.findById(campaignId)
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
      const nearestDrop = _this.map.findNearest(playerLat, playerLng, points)
      console.log('nearestDrop: ', nearestDrop)

      // Get the distance to the nearest drop.
      const distance = _this.map.getDistance(
        nearestDrop.latitude,
        nearestDrop.longitude,
        playerLat,
        playerLng
      )
      // console.log('distance: ', distance)

      // Get the direction to the nearest drop.
      const direction = _this.map.getHeading(
        nearestDrop.latitude,
        nearestDrop.longitude,
        playerLat,
        playerLng
      )
      // console.log('direction: ', direction)

      return {
        distance,
        direction,
        nearestDrop
      }
    } catch (err) {
      console.error('Error in play/controller.js/_getDirections()')
      throw err
    }
  }

  /**
   * @api {post} /play/claim Transfer tokens to the player
   * @apiPermission public
   * @apiName ClaimTokens
   * @apiGroup Play
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X POST -d '{ "playerInfo": { "campaignId": "6003740f8683ce20a734887a", "lat": 47.5924342, "lng": -122.3547189 } }' localhost:5001/play/directions
   *
   */
  async claimToken (ctx) {
    try {
      const playerInfo = ctx.request.body.playerInfo
      const { playerAddr, playerLat, playerLng, campaignId } = playerInfo

      // TODO: Put input validation code here.

      // Find the nearest Drop for the given campaign.
      const geoInfo = await _this._getDirections(
        campaignId,
        playerLat,
        playerLng
      )
      console.log(`geoInfo: ${JSON.stringify(geoInfo, null, 2)}`)
      const { distance, nearestDrop } = geoInfo

      // If the player coordinates are further than 100 meters, exit.
      const MINIMUM_DISTANCE = 100 // meters
      if (distance > MINIMUM_DISTANCE) {
        ctx.body = {
          success: false,
          message: 'Not close enough',
          txid: ''
        }

        return
      }

      // Get the Campaign the player is currently playing.
      const thisCampaign = await _this.Campaign.findById(campaignId)
      console.log(`thisCampaign: ${JSON.stringify(thisCampaign, null, 2)}`)

      // Get the model for that Drop.
      const dropId = await _this._findDrop(nearestDrop.latitude, nearestDrop.longitude, thisCampaign.drops)
      console.log('dropId: ', dropId)

      // Exit if the Drop could not be found.
      if (!dropId) {
        ctx.body = {
          success: false,
          message: 'Could not find Drop in database',
          txid: ''
        }

        return
      }

      // Mark the Drop as claimed.
      const thisDrop = await _this.Drop.findById(dropId)
      console.log(`thisDrop: ${JSON.stringify(thisDrop, null, 2)}`)

      // Transfer the SLP token to the player
      console.log(`Will transfer Drop ${dropId} to player address ${playerAddr}`)

      // Mark the drop as claimed.
      thisDrop.hasBeenClaimed = true
      await thisDrop.save()

      ctx.body = {
        success: true,
        message: 'Token claimed',
        txid: 'fake_txid'
      }
    } catch (err) {
      console.error('Error in play/controller.js/claimToken()')
      // console.log(`err.message: ${err.message}`)
      // console.log('err: ', err)
      ctx.throw(422, err.message)
    }
  }

  // This is a private function called by the claimToken() method.
  // Give the coordinates for the nearest drop, this method finds the Drop model
  // that matches those coordinates.
  async _findDrop (lat, lng, drops) {
    try {
      // Loop through all drops in the Campaign.
      for (let i = 0; i < drops.length; i++) {
        const thisDrop = await _this.Drop.findById(drops[i])
        // console.log(`thisDrop: ${JSON.stringify(thisDrop, null, 2)}`)

        if (thisDrop.lat === lat && thisDrop.lng === lng) {
          return thisDrop._id
        }
      }

      return false
    } catch (err) {
      console.error('Error in play/controller.js/_findDrop()')
      throw err
    }
  }
}

module.exports = PlayController
