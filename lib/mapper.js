var entities = require('entities')
var mapper = {}

mapper.flatten = function (arr) {
  return arr && arr[0] || null
}

mapper.unpack = function (obj) {
  if (typeof obj === 'object') {
    return obj.value || obj
  } else {
    return obj
  }
}

mapper.filterByType = function (arr, type) {
  return arr && arr.filter((item) => item.type === type) || null
}

mapper.mapUserResponse = function (response) {
  if (!response) {
    return null
  }

  var user = response.user[0]

  if (!user.id) {
    return null
  }

  return {
    id: user.id,
    name: user.name,
    firstname: mapper.unpack(mapper.flatten(user.firstname)),
    lastname: mapper.unpack(mapper.flatten(user.lastname)),
    country: mapper.unpack(mapper.flatten(user.country))
  }
}

mapper.mapBoardGameResponse = function (response) {
  if (!response || !response.items || !response.items[0] || !response.items[0].item || !response.items[0].item[0]) {
    return null
  }

  var boardgame = response.items[0].item[0]

  return {
    id: boardgame.id,
    name: mapper.unpack(boardgame.name.filter((item) => item.type === 'primary')[0]),
    description: entities.decodeXML(mapper.flatten(boardgame.description)),
    thumbnail: mapper.flatten(boardgame.thumbnail),
    image: mapper.flatten(boardgame.image),
    yearpublished: mapper.unpack(mapper.flatten(boardgame.yearpublished)),
    age: {
      min: Number(mapper.unpack(mapper.flatten(boardgame.minage)))
    },
    players: {
      min: Number(mapper.unpack(mapper.flatten(boardgame.minplayers))),
      max: Number(mapper.unpack(mapper.flatten(boardgame.maxplayers)))
    },
    playtime: {
      min: Number(mapper.unpack(mapper.flatten(boardgame.minplaytime))),
      max: Number(mapper.unpack(mapper.flatten(boardgame.maxplaytime)))
    },
    weight: Number(mapper.unpack(mapper.flatten(boardgame.statistics[0].ratings[0].averageweight))),
    rating: Number(mapper.unpack(mapper.flatten(boardgame.statistics[0].ratings[0].average))),
    categories: mapper.filterByType(boardgame.link, 'boardgamecategory').map(mapper.unpack),
    mechanics: mapper.filterByType(boardgame.link, 'boardgamemechanic').map(mapper.unpack),
  }
}

module.exports = mapper
