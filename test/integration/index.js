var bgg = require('../../')
var obcheckt = require('obcheckt')

module.exports = {
  'get a user that exists'() {
    return bgg.getUser('BohnanZar')
      .then(user => obcheckt.validate(user, {
        id: String,
        name: 'BohnanZar',
        firstname: String,
        lastname: String,
        country: String
      }))
  },
  'get a user that does not exist'() {
    return bgg.getUser('UserThatDoesNotExist')
      .then(user => obcheckt.validate(user, null))
  },
  'get a board game that exists'() {
    return bgg.getBoardGame('Cottage Garden')
      .then(boardGame => obcheckt.validate(boardGame, {
        id: String,
        name: 'Cottage Garden',
        description: String,
        thumbnail: String,
        image: String,
        yearpublished: String,
        age: {
          min: Number,
        },
        players: {
          min: Number,
          max: Number,
        },
        playtime: {
          min: Number,
          max: Number,
        },
        weight: Number,
        rating: Number
      }))
  },
  'get a board game that does not exist'() {
    return bgg.getBoardGame('BoardGameThatDoesNotExist')
      .then(boardGame => obcheckt.validate(boardGame, null))
  },
  'perform a search'() {
    return bgg.search({ query: 'Feast of Odin' })
      .then(results => obcheckt.validate(results, {
        total: Number,
        items: [Object]
      }))
  }
}
