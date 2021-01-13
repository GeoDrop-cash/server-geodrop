const Drop = require('../../models/drops')

let _this
class DropController {
  constructor () {
    _this = this
    this.Drop = Drop
  }

  /**
   * @api {post} /drops Create a new drop
   * @apiPermission drop
   * @apiName CreateDrop
   * @apiGroup Drops
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X POST -d '{ "drop": { "message": "Test Drop", "lat": 47.5924342, "long": -122.3547189 } }' localhost:5001/drops
   *
   */
  async createDrop (ctx) {
    const dropObj = ctx.request.body.drop
    try {
      /*
       * ERROR HANDLERS
       *
       */
      // Required property
      if (!dropObj.message || typeof dropObj.message !== 'string') {
        throw new Error("Property 'message' must be a string")
      }

      if (!dropObj.lat) {
        throw new Error("Property 'lat' must be a number")
      }

      if (!dropObj.long) {
        throw new Error("Property 'long' must be a number")
      }

      const drop = new _this.Drop(dropObj)

      await drop.save()

      ctx.body = {
        drop
      }
    } catch (err) {
      // console.log(`err.message: ${err.message}`)
      // console.log('err: ', err)
      ctx.throw(422, err.message)
    }
  }

  /**
   * @api {get} /drops Get all drops
   * @apiPermission drop
   * @apiName GetDrops
   * @apiGroup Drops
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X GET localhost:5001/drops
   *
   */
  async getDrops (ctx) {
    try {
      const drops = await _this.Drop.find({})
      ctx.body = { drops }
    } catch (error) {
      ctx.throw(404)
    }
  }

  /**
   * @api {get} /drops/:id Get drop by id
   * @apiPermission drop
   * @apiName GetDrop
   * @apiGroup Drops
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X GET localhost:5001/drops/56bd1da600a526986cf65c80
   *
   */

  async getDrop (ctx, next) {
    try {
      const drop = await _this.Drop.findById(ctx.params.id)
      if (!drop) {
        ctx.throw(404)
      }

      ctx.body = {
        drop
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
   * @api {put} /drops/:id Update a drop
   * @apiPermission drop
   * @apiName UpdateDrop
   * @apiGroup Drops
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X PUT -d '{ "drop": { "message": "Test Drop", "lat": 47.5924342, "long": -122.3547189 } }' localhost:5001/drops/56bd1da600a526986cf65c80
   *
   */
  async updateDrop (ctx) {
    // Values obtain from user request.
    // This variable is intended to validate the properties
    // sent by the client
    const dropObj = ctx.request.body.drop

    const drop = ctx.body.drop

    try {
      /*
       * ERROR HANDLERS
       *
       */
      if (!dropObj.message || typeof dropObj.message !== 'string') {
        throw new Error("Property 'message' must be a string")
      }

      if (!dropObj.lat) {
        throw new Error("Property 'lat' must be a number")
      }

      if (!dropObj.long) {
        throw new Error("Property 'long' must be a number")
      }

      Object.assign(drop, ctx.request.body.drop)

      await drop.save()

      ctx.body = {
        drop
      }
    } catch (error) {
      ctx.throw(422, error.message)
    }
  }

  /**
   * @api {delete} /drops/:id Delete a drop
   * @apiPermission drop
   * @apiName DeleteDrop
   * @apiGroup Drops
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X DELETE localhost:5001/drops/56bd1da600a526986cf65c80
   *
   */
  async deleteDrop (ctx) {
    const drop = ctx.body.drop
    await drop.remove()
    ctx.status = 200
    ctx.body = {
      success: true
    }
  }
}

module.exports = DropController
