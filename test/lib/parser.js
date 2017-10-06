var assert = require('assert')
var EventEmitter = require('events')
var parser = require('../../lib/parser')

module.exports = {
  'exports an object'() {
    assert(typeof parser === 'object')
  },
  'exports a function as `capture`'() {
    assert(typeof parser.capture === 'function')
  },
  'capture accepts an EventEmitter'() {
    var emitter = new EventEmitter()

    parser.capture(emitter)
  },
  'capture returns a Promise'() {
    var emitter = new EventEmitter()

    assert(typeof parser.capture(emitter).then === 'function')
  },
  'capture resolves to an object on end'() {
    var emitter = new EventEmitter()
    var promise = parser.capture(emitter)

    emitter.emit('end')

    return promise.then(function (obj) {
      assert(typeof obj === 'object')
    })
  },
  'capture resolves to an object on end with given attributes'() {
    var emitter = new EventEmitter()
    var promise = parser.capture(emitter)

    emitter.emit('attribute', { name: 'key', value: 42 })
    emitter.emit('end')

    return promise.then(function (obj) {
      assert(obj.key === 42)
    })
  },
  'capture resolves to an object on end with given subobjects'() {
    var emitter = new EventEmitter()
    var promise = parser.capture(emitter)

    emitter.emit('opentagstart', { name: 'test-tag' })
    emitter.emit('closetag', 'test-tag')
    emitter.emit('end')

    return promise.then(function (obj) {
      assert.deepEqual(obj['test-tag'], [{}])
    })
  },
  'capture complex happy path'() {
    var emitter = new EventEmitter()
    var promise = parser.capture(emitter)

    emitter.emit('opentagstart', { name: 'items' })
    emitter.emit('attribute', { name: 'answer', value: 42 })
    emitter.emit('closetag', 'items')
    emitter.emit('opentagstart', { name: 'items' })
    emitter.emit('attribute', { name: 'another', value: true })
    emitter.emit('closetag', 'items')
    emitter.emit('opentagstart', { name: 'user' })
    emitter.emit('attribute', { name: 'name', value: 'Thingama Bob' })
    emitter.emit('closetag', 'user')
    emitter.emit('end')

    return promise.then(function (obj) {
      assert.deepEqual(obj, {
        items: [{
          answer: 42
        }, {
          another: true
        }],
        user: [{
          name: 'Thingama Bob'
        }]
      })
    })
  },
}
