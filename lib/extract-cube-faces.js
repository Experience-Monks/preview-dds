var clamp = require('clamp')

module.exports = function unpackDDSCubemap (dds, array, level) {
  level = level | 0

  if (!dds.cubemap) {
    throw new Error('provided DDS file is not a valid RGBA32f cubemap')
  }

  var faces = 6
  var images = dds.images
  var mipLevels = images.length / faces
  if (images.length % faces !== 0) {
    throw new Error('invalid number of image levels / faces in DDS cubemap')
  }
  if (level >= mipLevels) {
    throw new Error('level index must be < mipmap count in DDS file')
  }

  var shape = images[level].shape
  var facePixels = []

  for (var i = 0; i < faces; i++) {
    var face = i * mipLevels + level
    var faceImage = images[face]
    if (faceImage.shape[0] !== shape[0] || faceImage.shape[1] !== shape[1]) {
      throw new Error('invalid DDS - not all cubemap faces match in size')
    }

    var offset = faceImage.offset
    var length = faceImage.length
    var faceData = new Float32Array(array.slice(offset, offset + length))
    var pixelData = rgbaFloatToByte(faceData)
    facePixels.push(pixelData)
  }

  return {
    shape: shape,
    faces: facePixels
  }
}

function rgbaFloatToByte (data) {
  var pixels = new Uint8Array(data.length)
  for (var i = 0; i < data.length; i += 4) {
    for (var j = 0; j < 4; j++) {
      pixels[i + j] = clamp(Math.floor(data[i + j] * 255), 0, 255)
    }
  }
  return pixels
}
