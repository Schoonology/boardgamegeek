var http = require('http')
var https = require('https')
var mapper = require('./mapper')
var querystring = require('querystring')
var parser = require('./parser')
var url = require('url')

function getHttpLib(rootUrl) {
  switch (url.parse(rootUrl).protocol) {
    case 'https:':
      return https
    case 'http:':
      return http
    default:
      throw new Error('Unsupported protocol: ' + url.parse(rootUrl).protocol)
  }
}

function createClient(rootUrl) {
  var _http = getHttpLib(rootUrl)
  var client = {}

  client.get = function get(path, query) {
    return new Promise(function (resolve, reject) {
      _http.get(`${rootUrl}/${path}?${querystring.stringify(query || {})}`)
        .on('error', function (err) {
          console.log('ERROR:', err)
          reject(err)
        })
        .on('response', function (response) {
          if (response.statusCode === 200) {
            return resolve(response)
          }

          // TODO(schoon) - Buffer and print error messages.
          this.abort()

          const error = new Error(`Request failed with ${response.statusCode}.`)
          error.code = 'EBGG_UPSTREAM'
          reject(error)
        })
    })
      .then(function (response) {
        const stream = parser.stream()

        // TODO(schoon) - Obviate the need for this delay?
        setImmediate(() => response.pipe(stream))

        return parser.capture(stream)
          .catch(function (err) {
            throw new Error('Failed to parse response to [' + path + ',' + JSON.stringify(query) + '] with:\n' + err.message)
          })
      })
  }

  client.getUser = function getUser(name) {
    return client.get('user', {
      name
    })
      .then(mapper.mapUserResponse)
  }

  client.getThing = function getThing(id, options) {
    return client.get('thing', {
      id,
      stats: (options && options.stats) ? 1 : 0,
      type: options.type
    })
  }

  client.getThings = function getThings(ids, options) {
    return client.getThing(ids.join(','), options)
  }

  function handleErrors(response) {
    if (response.error) {
      return Promise.reject(new Error(response.error[0].message))
    }

    return response
  }

  client.search = function search(options) {
    return client.get('search', options)
      .then((response) => handleErrors(response))
      .then((response) => ({
        total: Number(response.items[0].total),
        items: response.items[0].item
      }))
  }

  function findThing(name, options) {
    var searchType = options && (options.searchType || options.type)
    var getType = options && (options.getType || options.type)
    var exact = options && options.exact

    return client.search({
      query: name,
      type: searchType,
      exact: 1
    })
      .then(function (response) {
        if ((response.total === 0 || !response.items) && !exact) {
          return client.search({
            query: name,
            type: searchType,
            exact: 0
          })
        }

        return response
      })
      .then(function (response) {
        if (response.total === 0 || !response.items) {
          return null
        }

        return client.getThing(response.items[0].id, {
          stats: true,
          type: getType
        })
      })
  }

  client.getBoardGame = function getBoardGame(name, options) {
    var includeExpansions = options && options.includeExpansions
    var exact = options && options.exact

    return findThing(name, {
      exact: !!exact,
      searchType: 'boardgame',
      getType: includeExpansions ? null : 'boardgame'
    })
      .then(mapper.mapBoardGameResponse)
  }

  client.getBoardGameExpansion = function getBoardGameExpansion(name) {
    var exact = options && options.exact

    return findThing(name, {
      exact: !!exact,
      type: 'boardgameexpansion'
    })
      .then(mapper.mapBoardGameResponse)
  }

  client.getBoardGameById =
  client.getBoardGameExpansionById =
  function getBoardGameById(id, options) {
    return client.getThing(id, {
      stats: true,
      type: 'boardgame'
    })
      .then(mapper.mapBoardGameResponse)
  }

  return client
}

module.exports = createClient
