var name = require('cube-face-name')
var range = require('array-range')

var nameArray = range(6).map(function (i) {
  return name(i)
})

var names = nameArray.reduce(function (dict, key, i) {
  dict[key] = i
  return dict
}, {})

module.exports = function (index) {
  return names[index]
}
