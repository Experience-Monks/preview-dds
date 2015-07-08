var triangle = require('a-big-triangle')
var Texture = require('glo-texture/2d')
var Shader = require('glo-shader')
var getContext = require('get-canvas-context')

var fs = require('fs')
var path = require('path')

module.exports = renderCompressed
function renderCompressed (dds, array, opt) {
  opt = opt || {}
  var level = opt.level || 0

  var vert = fs.readFileSync(path.join(__dirname, 'shader', 'vert.glsl'))
  var frag = fs.readFileSync(path.join(__dirname, 'shader', 'frag.glsl'))

  if (level >= dds.images.length) {
    throw new Error('level must be less than mip map level ' + dds.images.length)
  }
  var image = dds.images[level]
  var shape = opt.stretch ? dds.shape : image.shape
  var gl = getContext('webgl', {
    alpha: true,
    preserveDrawingBuffer: true,
    width: shape[0],
    height: shape[1]
  })

  var ext = gl.getExtension('WEBGL_compressed_texture_s3tc')
  if (!ext) {
    throw new Error('compressed texture rendering not supported on this GPU')
  }

  var shader = Shader(gl, { vertex: vert, fragment: frag })

  var texture = Texture(gl)
  texture.magFilter = gl.LINEAR
  texture.compressed = true
  texture.format = getFormat(ext, dds.format)

  var subArray = new Uint8Array(array, image.offset, image.length)
  texture.update(subArray, image.shape, 0)

  var canvas = gl.canvas
  document.body.appendChild(canvas)
  render()

  texture.dispose()
  shader.dispose()
  gl = null
  return canvas

  function render () {
    shader.bind()
    shader.uniforms.iChannel0(0)
    texture.bind()
    triangle(gl)
  }
}

function getFormat (ext, ddsFormat) {
  switch (ddsFormat) {
    case 'dxt1':
      return ext.COMPRESSED_RGB_S3TC_DXT1_EXT
    case 'dxt3':
      return ext.COMPRESSED_RGBA_S3TC_DXT3_EXT
    case 'dxt5':
      return ext.COMPRESSED_RGBA_S3TC_DXT5_EXT
    default:
      throw new Error('unsupported format ' + ddsFormat)
  }
}
