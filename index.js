var createClient = require('./lib/client')

module.exports = createClient('https://www.boardgamegeek.com/xmlapi2')
module.exports.client = createClient
