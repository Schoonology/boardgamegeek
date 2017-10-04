var https = require('https')
var mapper = require('./lib/mapper')
var querystring = require('querystring')
var parser = require('./lib/parser')
var ROOT_URL = 'https://www.boardgamegeek.com/xmlapi2'

function get(path, query) {
  var stream = parser.stream()

  https.get(
    `${ROOT_URL}/${path}?${querystring.stringify(query || {})}`,
    (res) => res.pipe(stream)
  )

  return parser.capture(stream)
}

function getUser(name) {
  return get('user', {
    name
  })
    .then(mapper.mapUserResponse)
}

function getThing(id) {
  return get('thing', {
    id
  })
}

function getThings(ids) {
  return get('thing', {
    id: ids.join(',')
  })
}

function search(options) {
  return get('search', options)
    .then((response) => ({
      total: Number(response.items[0].total),
      items: response.items[0].item
    }))
}

function getBoardGame(name) {
  return search({
    query: name,
    type: 'boardgame',
    exact: 1
  })
    .then((response) => response.items[0])
    .then((result) => getThing(result.id))
    .then(mapper.mapBoardGameResponse)
}
