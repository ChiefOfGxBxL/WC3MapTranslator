<p align='center'>
  <b>WC3MapTranslator</b><br/>
  Translate <code>war3map</code> ⇄ <code>json</code> formats for WarCraft III .w3x maps
</p>
<p align='center'>
  <a href='https://www.npmjs.com/package/wc3maptranslator'>
    <img src='https://badge.fury.io/js/wc3maptranslator.svg?style=flat-square'/>
  </a>
  <a href='https://www.npmjs.com/package/wc3maptranslator'>
    <img src='https://img.shields.io/npm/dt/wc3maptranslator.svg'/>
  </a>
  <a href='https://opensource.org/licenses/MIT'>
    <img src='https://img.shields.io/badge/license-MIT-blue.svg'/>
  </a>

  <p align='center'>
    <b>Quality</b><br/>
    <a href='https://travis-ci.org/ChiefOfGxBxL/WC3MapTranslator'>
      <img src='https://travis-ci.org/ChiefOfGxBxL/WC3MapTranslator.svg?branch=master' />
    </a>
    <a href='http://packagequality.com/#?package=wc3maptranslator'>
      <img src='http://npm.packagequality.com/shield/wc3maptranslator.svg' />
    </a>
    <a href='https://codeclimate.com/github/ChiefOfGxBxL/WC3MapTranslator'>
      <img src='https://api.codeclimate.com/v1/badges/065fcb3a010c892f3813/maintainability' />
    </a>
    <br/>
    <a href='https://coveralls.io/github/ChiefOfGxBxL/WC3MapTranslator?branch=master'>
      <img src='https://coveralls.io/repos/github/ChiefOfGxBxL/WC3MapTranslator/badge.svg?branch=master' />
    </a>
    <a href="https://snyk.io/test/github/chiefofgxbxl/wc3maptranslator?targetFile=package.json">
      <img src="https://snyk.io/test/github/chiefofgxbxl/wc3maptranslator/badge.svg?targetFile=package.json" alt="Known Vulnerabilities" data-canonical-src="https://snyk.io/test/github/chiefofgxbxl/wc3maptranslator?targetFile=package.json" style="max-width:100%;">
    </a>
  </p>
</p>

<hr/>
<p align='center'>
  <a href="#overview"><strong>Overview</strong></a> &middot;
  <a href="#install"><strong>Install</strong></a> &middot;
  <a href="#usage"><strong>Usage</strong></a> &middot;
  <a href="#file-support"><strong>File Support</strong></a> &middot;
  <a href="#specification"><strong>Specification</strong></a> &middot;
  <a href="#contributing"><strong>Contributing</strong></a> &middot;
  <a href="#special-thanks"><strong>Special Thanks</strong></a>
</p>
<hr/>

## Overview
WC3MapTranslator is a TypeScript module and CLI to convert between JSON and WarCraft III (.w3x) `war3map` formats. This makes the map data readable and easily modifiable, a perfect format for storing WC3 maps in Git repositories and inspecting diffs!

![TranslationExample](https://user-images.githubusercontent.com/4079034/71315302-4947fb00-2427-11ea-8f50-edf05d6e5c6a.png)

## Install
```sh
# Global install recommended for CLI usage; for local install drop the -g flag
npm install -g wc3maptranslator
```

**Requires Node ≥ 24**  

## Usage (CLI)
```sh
# wc3maptranslator <input> [output]

# Usage (individual files, same directory)
wc3maptranslator terrain.json  # outputs war3map.w3e in CWD
wc3maptranslator war3map.w3i  # outputs info.json in CWD

# Usage (translate an entire folder)
wc3maptranslator ./path/to/war3mapFiles --toJson
wc3maptranslator ./path/to/jsonFiles --toWar

# See list of available translators and standard file names
wc3maptranslator --list

# See help
wc3maptranslator --help

# Useful flags
--force / -f Overwrite existing files (by default, translation is skipped if it would overwrite an existing file)
--silent / -s Silence success output messages (errors will still be shown)
```

## Usage (programmatic)
```ts
import {
  CamerasTranslator,
  DoodadsTranslator,
  ImportsTranslator,
  InfoTranslator,
  ObjectsTranslator,
  RegionsTranslator,
  SoundsTranslator,
  StringsTranslator,
  TerrainTranslator,
  UnitsTranslator
} from 'wc3maptranslator';

// E.g. let's create a camera for the map
const cameras = [
  {
    "target": {
      "x": -319.01,
      "y": -90.18
    },
    "offsetZ": 0,
    "rotation": 90,
    "aoa": 304,
    "distance": 2657.34,
    "roll": 5,
    "fov": 70,
    "farClipping": 5000,
    "name": "MyCamera1"
  }
]

// Now translate the JSON into the WarCraft III format
// All translators have: `.jsonToWar` and `.warToJson` functions
const translatedResult = CamerasTranslator.jsonToWar(cameras);

// `translatedResult` contains a `buffer` which can be saved to disk
// This war3map.w3c file can now be placed inside a .w3x via an MPQ
// editor, and you should now see a camera in the Camera Palette!
fs.writeFileSync('war3map.w3c', translatedResult.buffer);
```

## File Support

### World files

| Type                    | Json → War  | War → Json  | File          |
|-------------------------|:-----------:|:-----------:|---------------|
| Terrain                 | ✅ | ✅ | war3map.w3e      |
| Units                   | ✅ | ✅ | war3mapUnits.doo |
| Doodads                 | ✅ | ✅ | war3map.doo      |
| Regions                 | ✅ | ✅ | war3map.w3r      |
| Cameras                 | ✅ | ✅ | war3map.w3c      |

### Object data files

| Type                    | Json → War  | War → Json  | File          |
|-------------------------|:-----------:|:-----------:|---------------|
| Units - Objects         | ✅ | ✅ | war3map.w3u     |
| Items - Objects         | ✅ | ✅ | war3map.w3t     |
| Abilities - Objects     | ✅ | ✅ | war3map.w3a     |
| Destructables - Objects | ✅ | ✅ | war3map.w3b / war3mapSkin.w3b     |
| Doodads - Objects       | ✅ | ✅ | war3map.w3d     |
| Upgrades - Objects      | ✅ | ✅ | war3map.w3q     |
| Buffs - Objects         | ✅ | ✅ | war3map.w3h     |

### Map files

| Type                    | Json → War  | War → Json  | File          |
|-------------------------|:-----------:|:-----------:|---------------|
| Info File               | ✅ | ✅ | war3map.w3i        |
| Imported Files          | ✅ | ✅ | war3map.imp        |
| Sounds (definitions)    | ✅ | ✅ | war3map.w3s        |
| Strings (triggers)      | ✅ | ✅ | war3map.wts        |
| Pathing                 | ❌ | ❌ | war3map.wpm        |
| Shadow map              | ❌ | ❌ | war3map.shd        |

### Not relevant
 ➖ Triggers (war3map.j, war3map.lua)  
 ➖ Custom Text Trigger File (war3map.wct)  
 ➖ Trigger Names File (war3map.wtg)  
 ➖ Menu Minimap (war3map.mmp)  
 ➖ Minimap Image (war3mapMap.blp)  
 ➖ Minimap Image (war3mapMap.b00)  
 ➖ Minimap Image (war3mapMap.tga)  
 ➖ Map Preview Image (war3mapPreview.tga)

## Specification
### WC3MapTranslator format
We have a detailed  explaining how to format a map in JSON. It explains everything from the high-level map object, all the way down to creating individual units, tiles, or custom objects.
 > 🔗 [WC3MapTranslator format](https://github.com/ChiefOfGxBxL/WC3MapTranslator/wiki)

### war3map format
The underlying WarCraft map files (e.g. war3map.doo) have been documented in a separate repository. If you are curious about how a .w3x file is composed, this is the place to learn!
 > 🔗 [WC3MapSpecification](https://github.com/ChiefOfGxBxL/WC3MapSpecification)

## Contributing
We encourage contributions! Generally, the process of making a change is:
1. Fork this repo
2. Develop your changes on a new branch
3. Submit a pull request to `master`

**Your code should**:
 * **run** (your code needs to work, of course)
 * **include tests** (run `npm run test` and include unit tests to demonstrate your code works under different conditions)
 * **be linted** (run `npm run lint` and follow the project's coding standards)
 * **pass CI** (we enforce: ESLint, unit tests pass, code coverage)

A code review is required on your PR to be accepted into `master`. A project member will get back to you within one week. If you haven't heard from someone regarding your PR, feel free to ping @chiefofgxbxl.

Your pull request may update `package.json` to include your username under the `contributors` field.

## Special Thanks
We owe a lot of thanks to *Chocobo* on [TheHelper](http://www.thehelper.net/) for the detailed documentation of the files found in a .w3x archive. Two tutorials are [here (1)](http://www.thehelper.net/threads/guide-explanation-of-w3m-and-w3x-files.35292/) and [here (2)](http://world-editor-tutorials.thehelper.net/cat_usersubmit.php?view=42787).
