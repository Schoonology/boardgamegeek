var sax = require('sax')
var parser = {}

parser.stream = function () {
  return sax.createStream({
    trim: true,
    normalize: true,
    lowercase: true
  })
}

parser.capture = function (stream) {
  return new Promise(function (resolve, reject) {
    var frames = [{}]

    stream.on('opentagstart', (node) => frames.push({}))
    stream.on('attribute', (node) => frames[frames.length - 1][node.name] = node.value)
    stream.on('text', (text) => text.trim().length && (frames[frames.length - 1] = text.trim()))
    stream.on('closetag', (name) => frames[frames.length - 2][name] = []
      .concat(frames[frames.length - 2][name] || [])
      .concat(frames.pop()))
    stream.on('end', () => resolve(frames.pop()))
    stream.on('error', reject)
  })
}

module.exports = parser
