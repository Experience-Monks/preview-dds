var extractCubemap = require('./extract-cube-faces')
var rgbaToCanvas = require('rgba-to-canvas')
var unwrap = require('./cube-face-unwrap')
var getContext = require('get-canvas-context')

module.exports = renderCubemap
function renderCubemap (dds, array, opt) {
  opt = opt || {}

  var level = opt.level || 0
  var cubemap = extractCubemap(dds, array, level)

  var shape = cubemap.shape
  var width = shape[0]
  var height = shape[1]
  var context = getContext('2d', {
    width: width * 4,
    height: height * 3,
    alpha: true
  })
  context.clearRect(0, 0, width, height)

  var canvas = context.canvas
  var isFace = typeof opt.face === 'number'
  if (isFace) {
    blit(opt.face)
  } else {
    cubemap.faces.forEach(function (face, i) {
      blit(i)
    })
  }
  document.body.appendChild(canvas)
  return canvas

  function blit (i) {
    var face = cubemap.faces[i]
    var image = rgbaToCanvas(face, shape)
    var pos = isFace ? [0, 0] : unwrap(i)
    context.drawImage(image, pos[0] * width, pos[1] * height)
  }
}
