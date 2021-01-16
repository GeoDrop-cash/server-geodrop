const config = require('../../config')
const axios = require('axios').default
const assert = require('chai').assert
const sinon = require('sinon')

// Mock data
// const mockData = require('./mocks/contact-mocks')

const LOCALHOST = `http://localhost:${config.port}`

// const mockContext = require('./mocks/ctx-mock').context
// const PlayController = require('../../src/modules/play/controller')
const Campaign = require('../../src/models/campaigns')
const Drop = require('../../src/models/drops')
// let uut
let sandbox

describe('Play', () => {
  before(async () => {
    // Delete all campaign and drop models in the database.
    await deleteAllDrops()
    await deleteAllCampaigns()

    const body = {
      campaign: {
        merchant: 'test',
        drops: [
          {
            lat: 48.5107787,
            lng: -122.6143138
          },
          {
            lat: 48.5224765,
            lng: -122.5936715
          },
          {
            lat: 48.5039407,
            lng: -122.5756471
          }
        ]
      }
    }

    // Create a Campaign with three drops.
    const options = {
      method: 'POST',
      url: `${LOCALHOST}/campaigns`,
      data: body
    }

    await axios(options)
  })

  beforeEach(() => {
    // uut = new PlayController()

    sandbox = sinon.createSandbox()
  })

  afterEach(() => sandbox.restore())

  describe('POST /play', () => {
    it('should throw error if email property is not provided', async () => {
      try {
        // const options = {
        //   method: 'POST',
        //   url: `${LOCALHOST}/contact/email`,
        //   data: {
        //     obj: {
        //       formMessage: 'message'
        //     }
        //   }
        // }
        //
        // await axios(options)
        //
        // // console.log(`result: ${JSON.stringify(result, null, 2)}`)
        //
        // // console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        // assert(false, 'Unexpected result')
      } catch (err) {
        assert.equal(err.response.status, 422)
        assert.include(err.response.data, "Property 'email' must be a string!")
      }
    })
  })
})

async function deleteAllCampaigns () {
  try {
    // Get all the campaigns in the DB.
    const campaigns = await Campaign.find({})
    // console.log(`users: ${JSON.stringify(users, null, 2)}`)

    // Delete each user.
    for (let i = 0; i < campaigns.length; i++) {
      const thisCampaign = campaigns[i]
      await thisCampaign.remove()
    }
  } catch (err) {
    console.error('Error in deleteAllCampaigns()')
    throw err
  }
}

async function deleteAllDrops () {
  try {
    // Get all the campaigns in the DB.
    const drops = await Drop.find({})
    // console.log(`users: ${JSON.stringify(users, null, 2)}`)

    // Delete each user.
    for (let i = 0; i < drops.length; i++) {
      const thisDrop = drops[i]
      await thisDrop.remove()
    }
  } catch (err) {
    console.error('Error in deleteAllDrops()')
    throw err
  }
}
