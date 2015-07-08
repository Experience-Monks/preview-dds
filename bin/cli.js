#!/usr/bin/env node

const spawn = require('child_process').spawn
const electron = require('electron-prebuilt')
const path = require('path')
const fs = require('fs')
const minimist = require('minimist')
const args = process.argv.slice(2)
const argv = minimist(args)
const cleanLogs = require('electron-clean-logging')

const serverPath = path.join(__dirname, '../server.js')
const file = process.argv[2]

if (file) {
  if (!fs.existsSync(path.resolve(file))) {
    console.error('Cannot access ', file + ': No such file')
    process.exit(1)
  }
} else if (process.stdin.isTTY) {
  console.error('No file path specified')
  process.exit(1)
} else {
  console.error('pipe from stdin not yet supported - PRs welcome :)')
  process.exit(1)
}

// spawn electron
var proc = spawn(electron, [ serverPath ].concat(args))
proc.stdout.pipe(process.stdout)

if (argv.verbose) {
  proc.stderr.pipe(process.stderr)
} else {
  proc.stderr.pipe(cleanLogs()).pipe(process.stderr)
}
