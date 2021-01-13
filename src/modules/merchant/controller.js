const Merchant = require('../../models/merchants')

let _this
class MerchantController {
  constructor () {
    _this = this
    this.Merchant = Merchant
  }

  /**
   * @api {post} /merchants Create a new merchant
   * @apiPermission merchant
   * @apiName CreateMerchant
   * @apiGroup Merchants
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X POST -d '{ "merchant": { "name": "Local Coffee Shop" } }' localhost:5001/merchants
   *
   */
  async createMerchant (ctx) {
    const merchantObj = ctx.request.body.merchant
    try {
      /*
       * ERROR HANDLERS
       *
       */
      // Required property
      if (!merchantObj.name || typeof merchantObj.name !== 'string') {
        throw new Error("Property 'name' must be a string")
      }

      const merchant = new _this.Merchant(merchantObj)

      await merchant.save()

      ctx.body = {
        merchant
      }
    } catch (err) {
      // console.log(`err.message: ${err.message}`)
      // console.log('err: ', err)
      ctx.throw(422, err.message)
    }
  }

  /**
   * @api {get} /merchants Get all merchants
   * @apiPermission merchant
   * @apiName GetMerchants
   * @apiGroup Merchants
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X GET localhost:5001/merchants
   *
   */
  async getMerchants (ctx) {
    try {
      const merchants = await _this.Merchant.find({})
      ctx.body = { merchants }
    } catch (error) {
      ctx.throw(404)
    }
  }

  /**
   * @api {get} /merchants/:id Get merchant by id
   * @apiPermission merchant
   * @apiName GetMerchant
   * @apiGroup Merchants
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X GET localhost:5001/merchants/56bd1da600a526986cf65c80
   *
   */

  async getMerchant (ctx, next) {
    try {
      const merchant = await _this.Merchant.findById(ctx.params.id)
      if (!merchant) {
        ctx.throw(404)
      }

      ctx.body = {
        merchant
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
   * @api {put} /merchants/:id Update a merchant
   * @apiPermission merchant
   * @apiName UpdateMerchant
   * @apiGroup Merchants
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X PUT -d '{ "merchant": { "name": "Local Coffee Shop" } }' localhost:5001/merchants/56bd1da600a526986cf65c80
   *
   */
  async updateMerchant (ctx) {
    // Values obtain from user request.
    // This variable is intended to validate the properties
    // sent by the client
    const merchantObj = ctx.request.body.merchant

    const merchant = ctx.body.merchant

    try {
      /*
       * ERROR HANDLERS
       *
       */
      if (!merchantObj.name || typeof merchantObj.name !== 'string') {
        throw new Error("Property 'name' must be a string")
      }

      Object.assign(merchant, ctx.request.body.merchant)

      await merchant.save()

      ctx.body = {
        merchant
      }
    } catch (error) {
      ctx.throw(422, error.message)
    }
  }

  /**
   * @api {delete} /merchants/:id Delete a merchant
   * @apiPermission merchant
   * @apiName DeleteMerchant
   * @apiGroup Merchants
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X DELETE localhost:5001/merchants/56bd1da600a526986cf65c80
   *
   */
  async deleteMerchant (ctx) {
    const merchant = ctx.body.merchant
    await merchant.remove()
    ctx.status = 200
    ctx.body = {
      success: true
    }
  }
}

module.exports = MerchantController
