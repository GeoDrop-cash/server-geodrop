const Campaign = require('../../models/campaigns')
const Drop = require('../../models/drops')

let _this
class CampaignController {
  constructor () {
    _this = this
    this.Campaign = Campaign
    this.Drop = Drop
  }

  /**
   * @api {post} /campaigns Create a new campaign
   * @apiPermission campaign
   * @apiName CreateCampaign
   * @apiGroup Campaigns
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X POST -d '{ "campaign": { "merchant": "56bd1da600a526986cf65c80" } }' localhost:5001/campaigns
   *
   */
  async createCampaign (ctx) {
    try {
      const campaignObj = ctx.request.body.campaign
      console.log(`campaignObj: ${JSON.stringify(campaignObj, null, 2)}`)

      /*
       * ERROR HANDLERS
       *
       */
      // Required property
      if (!campaignObj.merchant || typeof campaignObj.merchant !== 'string') {
        throw new Error("Property 'merchant' must be a string")
      }

      const campaign = new _this.Campaign(campaignObj)

      // Delete the drops array.
      campaign.drops = []

      // Get a new address for this campaign.
      const { cashAddress, addrIndex } = await campaign.getAddress()
      campaign.bchAddr = cashAddress
      campaign.hdIndex = addrIndex

      // Add map data.
      campaign.lat = campaignObj.lat
      campaign.long = campaignObj.long
      campaign.radius = campaignObj.radius

      // Generate Drop models from the input data.
      for (let i = 0; i < campaignObj.drops.length; i++) {
      // for (let i = 0; i < 1; i++) {
        const thisDropInfo = campaignObj.drops[i]
        // console.log(`thisDropInfo: ${JSON.stringify(thisDropInfo, null, 2)}`)

        const dropObj = {
          lat: thisDropInfo.lat,
          lng: thisDropInfo.lng
        }

        const drop = new _this.Drop(dropObj)

        await drop.save()
        // console.log(`drop: ${JSON.stringify(drop, null, 2)}`)

        // Add Drop models to the campaign.drops array.
        campaign.drops.push(drop._id)
      }

      await campaign.save()

      // TODO: Loop through the Drops that were just created and add the
      // ID of the campaign model to them.

      ctx.body = {
        campaign
      }
    } catch (err) {
      console.error('Error in create campaign endpoint: ', err)
      // console.log(`err.message: ${err.message}`)
      // console.log('err: ', err)
      ctx.throw(422, err.message)
    }
  }

  /**
   * @api {get} /campaigns Get all campaigns
   * @apiPermission campaign
   * @apiName GetCampaigns
   * @apiGroup Campaigns
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X GET localhost:5001/campaigns
   *
   */
  async getCampaigns (ctx) {
    try {
      const campaigns = await _this.Campaign.find({})
      ctx.body = { campaigns }
    } catch (error) {
      ctx.throw(404)
    }
  }

  /**
   * @api {get} /campaigns/:id Get campaign by id
   * @apiPermission campaign
   * @apiName GetCampaign
   * @apiGroup Campaigns
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X GET localhost:5001/campaigns/56bd1da600a526986cf65c80
   *
   */

  async getCampaign (ctx, next) {
    try {
      const campaign = await _this.Campaign.findById(ctx.params.id)
      if (!campaign) {
        ctx.throw(404)
      }

      ctx.body = {
        campaign
      }
    } catch (err) {
      // Handle different error types.
      if (
        err === 404 ||
        err.name === 'CastError' ||
        err.message.toString().includes('Not Found')
      ) {
        ctx.throw(404)
      }

      ctx.throw(500)
    }

    if (next) {
      return next()
    }
  }

  /**
   * @api {put} /campaigns/:id Update a campaign
   * @apiPermission campaign
   * @apiName UpdateCampaign
   * @apiGroup Campaigns
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X PUT -d '{ "campaign": { "merchant": "56bd1da600a526986cf65c80" } }' localhost:5001/campaigns/56bd1da600a526986cf65c80
   *
   */
  async updateCampaign (ctx) {
    // Values obtain from user request.
    // This variable is intended to validate the properties
    // sent by the client
    const campaignObj = ctx.request.body.campaign

    const campaign = ctx.body.campaign

    try {
      /*
       * ERROR HANDLERS
       *
       */
      if (!campaignObj.merchant || typeof campaignObj.merchant !== 'string') {
        throw new Error("Property 'merchant' must be a string")
      }

      Object.assign(campaign, ctx.request.body.campaign)

      await campaign.save()

      ctx.body = {
        campaign
      }
    } catch (error) {
      ctx.throw(422, error.message)
    }
  }

  /**
   * @api {delete} /campaigns/:id Delete a campaign
   * @apiPermission campaign
   * @apiName DeleteCampaign
   * @apiGroup Campaigns
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X DELETE localhost:5001/campaigns/56bd1da600a526986cf65c80
   *
   */
  async deleteCampaign (ctx) {
    const campaign = ctx.body.campaign
    await campaign.remove()
    ctx.status = 200
    ctx.body = {
      success: true
    }
  }
}

module.exports = CampaignController
