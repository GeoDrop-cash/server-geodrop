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
  let campaignId = ''

  before(async () => {
    // Delete all campaign and drop models in the database.
    await deleteAllDrops()
    await deleteAllCampaigns()

    // Create a campaign with three Drops.
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

    const data = await axios(options)
    // console.log(`data.data: ${JSON.stringify(data.data, null, 2)}`)

    campaignId = data.data.campaign._id
  })

  beforeEach(() => {
    // uut = new PlayController()

    sandbox = sinon.createSandbox()
  })

  afterEach(() => sandbox.restore())

  describe('POST /play', () => {
    it('should get directions to the nearest drop', async () => {
      try {
        const body = {
          playerInfo: {
            campaignId,
            lat: 48.5002868,
            lng: -122.649676
          }
        }

        const options = {
          method: 'POST',
          url: `${LOCALHOST}/play/directions`,
          data: body
        }

        const result = await axios(options)

        // console.log(`result.data: ${JSON.stringify(result.data, null, 2)}`)

        assert.property(result.data, 'distance')
        assert.property(result.data, 'direction')
      } catch (err) {
        console.log('Error: ', err)
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
