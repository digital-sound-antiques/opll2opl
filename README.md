# 2413-to-3812

OPLL to OPL/OPL2 data converter for VGM files.

# Install

```
$ npm install -g 2413-to-3812
```

# Usage

The following command converts the YM2413 commands in `sample.vgm` to YM3812, then write `sample.ym3812.vgm`.

```
$ 2413-to-3812 sample.vgm
```

# Options

```
Usage: 2413-to-3812 [options] vgmfile

Options:
  --version     Show version number                                    [boolean]
  --type, -t    Specify output chip
                      [choices: "ym3812", "ym3526", "y8950"] [default: "ym3812"]
  --output, -o  Specify output file name (without file extension)
  --zip, -z     Zip-compress output                                    [boolean]
  --help        Show help                                              [boolean]
```
