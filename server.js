const BrowserWindow = require('browser-window')
const crashReporter = require('crash-reporter')
const path = require('path')
const app = require('app')
const parseDDS = require('parse-dds')
const fs = require('fs')
const toArrayBuffer = require('buffer-to-arraybuffer')
const minimist = require('minimist')
const globalShortcut = require('global-shortcut')
const assign = require('object-assign')
const ipc = require('ipc')
const ERROR_SIZE = [500, 400]
const cubeFaceFromName = require('./lib/cube-face-from-name')

crashReporter.start()

app.commandLine.appendSwitch('disable-http-cache')
app.commandLine.appendSwitch('v', 0)
app.commandLine.appendSwitch('vmodule', 'console=0')

const argv = minimist(process.argv.slice(2), {
  alias: {
    level: 'l',
    quality: 'q',
    output: 'o',
    verbose: 'v',
    face: 'f'
  }
})
const filePath = argv._[0]
const fullPath = path.resolve(filePath)

// allow "px" instead of index
if (typeof argv.face === 'string') {
  argv.face = cubeFaceFromName(argv.face)
}

var lastError, browserWindow

process.on('uncaughtException', function (err) {
  process.stderr.write((err.stack ? err.stack : err) + '\n')
  if (argv.output) {
    app.quit(1)
  } else {
    lastError = err
    printLastError()
  }
})

app.on('window-all-closed', function () {
  app.quit()
})

app.on('ready', function () {
  var headers = parseHeaders()
  if (headers.error && argv.output) {
    throw headers.error
  }

  browserWindow = new BrowserWindow({
    title: headers.error ? 'ERROR' : [
      path.basename(filePath),
      headers.textureShape.join('x'),
      headers.format
    ].join(' - '),
    'use-content-size': true,
    width: headers.shape[0],
    height: headers.shape[1]
  })

  browserWindow.loadUrl('file://' + __dirname + '/index.html')
  browserWindow.webContents.on('did-finish-load', function () {
    if (argv.debug) {
      browserWindow.openDevTools({ detach: true })
    }

    if (lastError) {
      printLastError()
    } else {
      browserWindow.webContents.send('file', assign({}, argv, {
        file: fullPath
      }))
    }
  })

  ipc.on('finished', function () {
    if (argv.output) {
      app.quit()
    }
  })

  ipc.on('error', function () {
    browserWindow.setSize(ERROR_SIZE[0], ERROR_SIZE[1])
  })

  globalShortcut.register('CmdOrCtrl+R', function () {
    browserWindow.reloadIgnoringCache()
  })

  function parseHeaders () {
    // could optimize this to stream in headers only ?
    var buf = fs.readFileSync(fullPath)
    var minSize = [128, 128]
    var textureShape = ERROR_SIZE.slice()
    var shape = ERROR_SIZE.slice()
    var dds
    try {
      dds = parseDDS(toArrayBuffer(buf))

      // if we have a valid mipmap level
      var mipmapCount = dds.images.length
      if (dds.cubemap) {
        mipmapCount = mipmapCount / 6
      }

      if (typeof argv.face === 'number' && argv.face >= 6) {
        lastError = new Error('invalid face; must be < 6')
      } else if (typeof argv.level !== 'number' || argv.level < mipmapCount) {
        if (argv.level && !argv.stretch) {
          shape = dds.images[argv.level].shape
        } else {
          shape = dds.shape
        }

        textureShape = shape.slice()
        if (dds.cubemap && typeof argv.face !== 'number') {
          shape[0] = shape[0] * 4
          shape[1] = shape[1] * 3
        }
      } else {
        lastError = new Error('invalid level, should be less than ' + mipmapCount)
      }
    } catch (e) {
      lastError = e
    }

    shape[0] = argv.output ? 0 : Math.max(minSize[0], shape[0])
    shape[1] = argv.output ? 0 : Math.max(minSize[1], shape[1])
    return {
      textureShape: textureShape,
      shape: shape,
      error: lastError,
      format: dds ? dds.format : 'error'
    }
  }
})

function printLastError () {
  if (!browserWindow || !lastError) return
  var err = lastError.message
  browserWindow.webContents.send('error', err)
  browserWindow.setSize(ERROR_SIZE[0], ERROR_SIZE[1])
  lastError = null
}
