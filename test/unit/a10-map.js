/*
  Unit tests for the map.js library
*/

const Map = require('../../src/lib/map')
let uut

describe('#map.js', () => {
  before(() => {
    uut = new Map()
  })

  describe('#getDistance', () => {
    it('should get the distance between two points', () => {
      const playerLat = 48.5002868
      const playerLong = -122.649676

      const dropLat = 48.5107787
      const dropLong = -122.6143138

      const meters = uut.getDistance(dropLat, dropLong, playerLat, playerLong)
      console.log('meters: ', meters)
    })
  })

  describe('#getHeading', () => {
    it('should get the distance between two points', () => {
      const playerLat = 48.5002868
      const playerLong = -122.649676

      const dropLat = 48.5107787
      const dropLong = -122.6143138

      const direction = uut.getHeading(dropLat, dropLong, playerLat, playerLong)
      console.log('direction: ', direction)
    })
  })

  describe('#findNearest', () => {
    it('should get the closest point', () => {
      const playerLat = 48.5002868
      const playerLong = -122.649676

      const points = [
        {
          latitude: 48.5107787,
          longitude: -122.6143138
        },
        {
          latitude: 48.5224765,
          longitude: -122.5936715
        },
        {
          latitude: 48.5039407,
          longitude: -122.5756471
        }
      ]

      const closestPoint = uut.findNearest(playerLat, playerLong, points)
      console.log('closestPoint: ', closestPoint)
    })
  })
})
