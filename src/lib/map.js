/*
  This library contains functions for working with map data, lat and long.
*/

const geolib = require('geolib')

class Map {
  constructor (mapConfig) {
    this.geolib = geolib
  }

  // Get the distance in meters between the Drop and the Player
  getDistance (dropLat, dropLng, playerLat, playerLng) {
    try {
      const drop = { latitude: dropLat, longitude: dropLng }
      const player = { latitude: playerLat, longitude: playerLng }

      const meters = this.geolib.getDistance(drop, player)

      return meters
    } catch (err) {
      console.log('Error in getDistance()')
      throw err
    }
  }

  // Get a compass heading that the player should follow to get closer to the
  // Drop.
  getHeading (dropLat, dropLng, playerLat, playerLng) {
    try {
      const drop = { latitude: dropLat, longitude: dropLng }
      const player = { latitude: playerLat, longitude: playerLng }

      const direction = this.geolib.getCompassDirection(player, drop)

      return direction
    } catch (err) {
      console.log('Error in getHeading()')
      throw err
    }
  }

  // Given an array of points, find the one nearest to the player.
  // Points should be an array of objects. Each object should have a 'latitude'
  // and 'longitude' property.
  findNearest (playerLat, playerLng, points) {
    try {
      const playerObj = {
        latitude: playerLat,
        longitude: playerLng
      }

      const nearest = geolib.findNearest(playerObj, points)

      return nearest
    } catch (err) {
      console.log('Error in findNearest()')
      throw err
    }
  }
}

module.exports = Map
