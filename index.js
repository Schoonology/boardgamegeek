var createClient = require('./lib/client')
var mapper = require('./lib/mapper')

module.exports = createClient('https://www.boardgamegeek.com/xmlapi2')
module.exports.client = createClient
module.exports.mapper = mapper
