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
const EatBch = require('../../src/lib/eat-bch')
const mockData = require('./mocks/eatbch-mock')

let uut
let sandbox

describe('#EatBCH', () => {
  let campaignId = ''

  // before(async () => {
  //
  // })

  beforeEach(async () => {
    uut = new EatBch()

    sandbox = sinon.createSandbox()

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
    console.log(`data.data: ${JSON.stringify(data.data, null, 2)}`)

    campaignId = data.data.campaign._id
  })

  afterEach(() => sandbox.restore())

  describe('#sweepCampaign', () => {
    it('should sweep funds from the campaign', async () => {
      sandbox.stub(uut.bchjs.Electrumx, 'utxo').resolves(mockData.mockUtxos)

      // console.log(`campaignId: ${campaignId}`)

      const hex = await uut.sweepCampaign(campaignId)
      // console.log('hex: ', hex)

      assert.isString(hex)
    })
  })

  describe('#scanForFinishedCampaigns', () => {
    it('should scan campaigns', async () => {
      await uut.scanForFinishedCampaigns()
    })

    it('should sweep campaigns with no more drops', async () => {
      // Manipulate the campaign so it triggers the desired code path.
      let campaign = await Campaign.findById(campaignId)
      // console.log(`campaign start: ${JSON.stringify(campaign, null, 2)}`)
      campaign.isActive = false
      campaign.hasBeenPaid = true
      await campaign.save()

      await uut.scanForFinishedCampaigns()

      campaign = await Campaign.findById(campaignId)
      // console.log(`campaign end:: ${JSON.stringify(campaign, null, 2)}`)

      assert.equal(campaign.hasBeenSwept, true)
    })

    it('should sweep campaigns that have expired', async () => {
      const now = new Date()
      const THREE_WEEKS = 60000 * 60 * 24 * 7 * 3
      const threeWeeksAgo = new Date(now.getTime() - THREE_WEEKS)

      // Manipulate the campaign so it triggers the desired code path.
      let campaign = await Campaign.findById(campaignId)
      console.log(`campaign start: ${JSON.stringify(campaign, null, 2)}`)
      campaign.expiration = threeWeeksAgo.toISOString()
      await campaign.save()

      await uut.scanForFinishedCampaigns()

      campaign = await Campaign.findById(campaignId)
      console.log(`campaign end: ${JSON.stringify(campaign, null, 2)}`)

      assert.equal(campaign.hasBeenSwept, true)
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
