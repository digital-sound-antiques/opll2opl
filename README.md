# opll2opl

OPLL to OPLx data converter for VGM files.

# Install

```
$ npm install -g opll2opl
```

# Usage

The following command converts OPLL (YM2413) track in `sample.vgm` to YM3812, then write `sample.out.vgm`.

```
$ opll2opl -t ym3812 sample.vgm
```

The following command converts PSG (AY-3-8910) track in `sample.vgm` to y8950, then write `sample.out.vgm`.
Do not expect PSG conversion quality. Hardware envelope is not supported and noise generator is highly limited.

```
$ opll2opl -t none -p y8950 sample.vgm
```

Convert both OPLL and PSG tracks in `sample.vgm` to YMF262 (OPL3), then write `sample.out.vgm`.

```
$ opll2opl -t ymf262 -p ymf262 sample.vgm
```

# Options

```
Usage: opll2opl [options] vgmfile

Options:
  --version     Show version number                                    [boolean]
  --to, -t      Convert ym2413 track to specified device.
    [choices: "ym3812", "ym3526", "y8950", "ymf262", "none"] [default: "ym3812"]
  --output, -o  Specify output file name
  --zip, -z     Zip-compress output                                    [boolean]
  --psg-to, -p  Convert ay-3-8910 track to specified device. ym2413 and
                ay-3-8910 tracks are converted simultaneously only if ymf262 is
                selected.
      [choices: "ym3812", "ym3526", "y8950", "ymf262", "none"] [default: "none"]
  --help        Show help                                              [boolean]
```
