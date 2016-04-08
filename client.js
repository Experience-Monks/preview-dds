var parseDDS = require('parse-dds')
var fs = require('fs')
var ipc = require('ipc')
var toArrayBuffer = require('buffer-to-arraybuffer')
var canvasToBuffer = require('electron-canvas-to-buffer')

var renderCubemap = require('./lib/render-cubemap')
var renderCompressed = require('./lib/render-compressed')

ipc.on('file', function (opt) {
  var file = opt.file
  fs.readFile(file, function (err, buf) {
    if (err) return bail(err)
    var data = toArrayBuffer(buf)
    try {
      run(parseDDS(data), data, opt)
    } catch (e) {
      bail(e)
    }
  })
})

ipc.on('error', bail)

function run (dds, array, opt) {
  console.log('Size', dds.shape.join('x'))
  console.log('Format', dds.format)

  ipc.send('parse', { shape: dds.shape, format: dds.format })

  var canvas
  if (dds.cubemap) {
    canvas = renderCubemap(dds, array, opt)
  } else {
    canvas = renderCompressed(dds, array, opt)
  }
  var output = opt.output
  if (output) {
    if (/(jpeg|jpg)/i.test(output)) {
      output = 'image/jpg'
    } else {
      output = 'image/jpg'
    }

    var buffer = canvasToBuffer(canvas, output, opt.quality)
    process.stdout.write(buffer, function () {
      ipc.send('finished')
    })
  } else {
    ipc.send('finished')
  }
}

function bail (err) {
  var div = document.createElement('div')
  div.innerHTML = err.message ? err.message : err
  div.className = 'error'
  console.error(err)
  document.body.className = 'error'
  document.body.appendChild(div)
  ipc.send('error')
}
