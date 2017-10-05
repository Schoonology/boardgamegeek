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

mapper.mapUserResponse = function (response) {
  var user = response.user[0]

  return {
    id: user.id,
    name: user.name,
    firstname: mapper.unpack(mapper.flatten(user.firstname)),
    lastname: mapper.unpack(mapper.flatten(user.lastname)),
    country: mapper.unpack(mapper.flatten(user.country))
  }
}

mapper.mapBoardGameResponse = function (response) {
  if (!response) {
    return null
  }

  var boardgame = response.items[0].item[0]

  return {
    id: boardgame.id,
    name: mapper.unpack(boardgame.name.filter((item) => item.type === 'primary')[0]),
    description: mapper.flatten(boardgame.description),
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
    }
  }
}

module.exports = mapper
