# preview-dds

[![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

Preview and convert DDS files from the command line (compressed textures and HDR cubemaps). 

This only supports a limited range of DDS formats, see [here](https://github.com/Jam3/parse-dds).

<img src="http://i.imgur.com/gibac6e.png" width="80%" />

## Install

```sh
npm install preview-dds -g
```

## Usage

[![NPM](https://nodei.co/npm/preview-dds.png)](https://www.npmjs.com/package/preview-dds)

The CLI options are as follows:

```sh
Usage:
  preview-dds file [opt]

Options:
  --level, -l   optional mipmap level (default 0)
  --face, -f    optional cubemap face to preview (default all)
  --output, -o  write image to stdout (default: not used)
  --quality, -q if output is JPG, encoder quality (0.0 - 1.0)
```

## Basic Examples

Preview a cubemap as an unwrapped cross:

```sh
preview-dds my-cubemap.dds
```

Or, preview a single face and mipmap level of the cubemap:

```sh
preview-dds my-cubemap.dds --level=1 --face=px
```

Where `face` option can be a string like `px`, `py`, or `pz` -- or a number index into the faces array (see [cube-face-name](https://github.com/Jam3/cube-face-name)).

If no `face` is specified, all faces are shown together.

## Convert DDS to PNG/JPG

You can also use this tool to extract compressed textures and cube faces from a DDS file, by specifying `--output=png|jpg`. 

For example:

```sh
preview-dds my-cubemap.dds --output=jpg -q 0.8 -l 2 -f px > cube-face.jpg
```

The above writes a new file `cube-face.jpg` with a quality of 0.8, showing mipmap level 2 and the "positive x" face. Result:

![face](http://i.imgur.com/Rq0WrIB.jpg)

The `--output` flag (or `-o`) defaults to PNG.

## License

MIT, see [LICENSE.md](http://github.com/Jam3/preview-dds/blob/master/LICENSE.md) for details.
