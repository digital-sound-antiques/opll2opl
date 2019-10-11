# opll2opl

OPLL to OPLx data converter for VGM files.

# Install

```
$ npm install -g opll2opl
```

# Usage

## Convert YM2413 track in VGM to YM3812

```
$ opll2opl -t ym3812 sample.vgm
```

The resulting VGM file will be written into the current directly. The default file name is `output.vgm`.

## Convert AY-3-8910 track in VGM to Y8950

```
$ opll2opl -p y8950 sample.vgm
```

Since this will emulate PSG sound with 2-OP synthesis, do not expect PSG conversion is perfect. Hardware envelope is not supported and noise frequency is limited.

## Convert both YM2413 and AY-3-8910 tracks in VGM to YMF262

```
$ opll2opl -t ymf262 -p ymf262 sample.vgm
```

It is not allowed to specify the same device to `-t` and `-p` option exepct ymf262 (ymf262 has dual OPL2 compatible components).

# Options

```
Usage: cmd.ts [options] vgmfile

Options:
  --version     Show version number                                    [boolean]
  --to, -t      Convert ym2413 track to specified device.
      [choices: "ym3812", "ym3526", "y8950", "ymf262", "thru", "none"] [default:
                                                                         "thru"]
  --psg-to, -p  Convert ay-3-8910 track to specified device. ym2413 and
                ay-3-8910 tracks are converted simultaneously only if ymf262 is
                selected.
      [choices: "ym3812", "ym3526", "y8950", "ymf262", "thru", "none"] [default:
                                                                         "thru"]
  --output, -o  Specify output file name
  --zip, -z     Zip-compress output                                    [boolean]
  --help        Show help                                              [boolean]
```
