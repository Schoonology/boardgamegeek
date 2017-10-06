var https = require('https')
var mapper = require('./lib/mapper')
var querystring = require('querystring')
var parser = require('./lib/parser')
var ROOT_URL = 'https://www.boardgamegeek.com/xmlapi2'
var api = {}

api.get = function get(path, query) {
  var stream = parser.stream()

  https.get(
    `${ROOT_URL}/${path}?${querystring.stringify(query || {})}`,
    (res) => res.pipe(stream)
  )

  return parser.capture(stream)
}

api.getUser = function getUser(name) {
  return api.get('user', {
    name
  })
    .then(mapper.mapUserResponse)
}

api.getThing = function getThing(id, options) {
  return api.get('thing', {
    id,
    stats: (options && options.stats) ? 1 : 0
  })
}

api.getThings = function getThings(ids, options) {
  return api.getThing(ids.join(','), options)
}

api.search = function search(options) {
  return api.get('search', options)
    .then((response) => ({
      total: Number(response.items[0].total),
      items: response.items[0].item
    }))
}

api.getBoardGame = function getBoardGame(name) {
  return api.search({
    query: name,
    type: 'boardgame',
    exact: 1
  })
    .then(function (response) {
      if (response.total === 0 || !response.items) {
        return api.search({
          query: name,
          type: 'boardgame',
          exact: 0
        })
      }

      return response
    })
    .then(function (response) {
      if (response.total === 0 || !response.items) {
        return null
      }

      return api.getThing(response.items[0].id, { stats: true })
    })
    .then(mapper.mapBoardGameResponse)
}

module.exports = api
