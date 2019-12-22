<p align='center'>
  <b>WC3MapTranslator</b>
</p>
<p align='center'>
  Translate <code>war3map</code> ⇄ <code>json</code> formats for WarCraft III .w3x maps

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
    <br/><br/>
    <b>Info</b><br/>
    <a href='https://www.npmjs.com/package/wc3maptranslator'>
      <img src='https://badge.fury.io/js/wc3maptranslator.svg?style=flat-square'/>
    </a>
    <a href='https://www.npmjs.com/package/wc3maptranslator'>
      <img src='https://img.shields.io/npm/dt/wc3maptranslator.svg'/>
    </a>
    <a href='https://opensource.org/licenses/MIT'>
      <img src='https://img.shields.io/badge/license-MIT-blue.svg'/>
    </a>
  </p>

</p>

<hr/>
<p align='center'>
  <a href="#overview"><strong>Overview</strong></a> &middot;
  <a href="#install"><strong>Install</strong></a> &middot;
  <a href="#usage"><strong>Usage</strong></a> &middot;
  <a href="#examples"><strong>Examples</strong></a> &middot;
  <a href="#file-support"><strong>File Support</strong></a> &middot;
  <a href="#specification"><strong>Specification</strong></a> &middot;
  <a href="#contributing"><strong>Contributing</strong></a> &middot;
  <a href="#special-thanks"><strong>Special Thanks</strong></a>
</p>
<hr/>

## Overview
WC3MapTranslator is a module to convert a JSON representation of WarCraft III (.w3x) data to their `war3map` files, and vice-versa. This makes the map data readable and easily modifiable.

![TranslationExample](https://user-images.githubusercontent.com/4079034/71315302-4947fb00-2427-11ea-8f50-edf05d6e5c6a.png)

WC3MapTranslator is written in `TypeScript` starting from version `3.0.0`, offering type safety and improved development experience.

## Install
```ts
npm install wc3maptranslator
```

**Requires Node >= 8**  
**Tested with tsc Version 3.7.2**

## Usage
### JavaScript (version < 3.0.0)
```ts
var Translator = require('wc3maptranslator'),
    mapJson = { // Refer to "Specification"
        units: [...],
        doodads: [...],
        ...
    };
var unitResult = new Translator.Units.jsonToWar(mapJson.units);
```
### TypeScript (version >= 3.0.0)
```js
// JS import
const TranslatorLib = require('wc3maptranslator');
const Translator = new TranslatorLib();
console.log(Translator);
```
```ts
//... or TS import
import { Translator } from 'wc3maptranslator';
const myTranslator = new Translator();
console.log(Translator);
```
### Using the Translator
```ts
// e.g. unit translator
const unitResult = new Translator.Units.jsonToWar(mapJson.units);
// all:
* Doodads
* Strings
* Terrain
* Units
* Regions
* Cameras
* Sounds
* Objects
* Imports
* Info
```
We can now write the `unitResult.buffer` content to a file named "war3mapUnits.doo" and put it in a .w3x archive! Using individual translators, we may convert JSON representation to generate a WC3 .w3x map file. See the Wiki for more information.

## Examples
There is an `examples` directory that demonstrates how to use *each* translator, both for converting from war3map to JSON, and JSON to war3map formats. This is a great starting point to learn how to use any translator.

To get started with either example, `cd` into `/examples/` and run `npm install` to install all the dependencies. Then run `npm start` which kicks off the TypeScript build and then executes the resulting JavaScript. A few output files will be written under the `/examples/` directory, but the output is purposely not comprehensive to avoid spamming the directory and because the translation process is sufficiently demonstrated using just one example of translating in each direction.

## File Support

### World files

| Type                    | Json → War  | War → Json  | File          |
|-------------------------|:-----------:|:-----------:|---------------|
| Terrain                 | ![check](https://cloud.githubusercontent.com/assets/4079034/25298706/7a881946-26c5-11e7-896b-402f60a0f059.png) | ![times](https://cloud.githubusercontent.com/assets/4079034/25298706/7a881946-26c5-11e7-896b-402f60a0f059.png) | war3map.w3e      |
| Units                   | ![check](https://cloud.githubusercontent.com/assets/4079034/25298706/7a881946-26c5-11e7-896b-402f60a0f059.png) | ![check](https://cloud.githubusercontent.com/assets/4079034/25298706/7a881946-26c5-11e7-896b-402f60a0f059.png) | war3mapUnits.doo |
| Doodads                 | ![check](https://cloud.githubusercontent.com/assets/4079034/25298706/7a881946-26c5-11e7-896b-402f60a0f059.png) | ![check](https://cloud.githubusercontent.com/assets/4079034/25298706/7a881946-26c5-11e7-896b-402f60a0f059.png) | war3map.doo      |
| Regions                 | ![check](https://cloud.githubusercontent.com/assets/4079034/25298706/7a881946-26c5-11e7-896b-402f60a0f059.png) | ![check](https://cloud.githubusercontent.com/assets/4079034/25298706/7a881946-26c5-11e7-896b-402f60a0f059.png) | war3map.w3r      |
| Cameras                 | ![check](https://cloud.githubusercontent.com/assets/4079034/25298706/7a881946-26c5-11e7-896b-402f60a0f059.png) | ![check](https://cloud.githubusercontent.com/assets/4079034/25298706/7a881946-26c5-11e7-896b-402f60a0f059.png) | war3map.w3c      |
| Sounds (definitions)    | ![check](https://cloud.githubusercontent.com/assets/4079034/25298706/7a881946-26c5-11e7-896b-402f60a0f059.png) | ![check](https://cloud.githubusercontent.com/assets/4079034/25298706/7a881946-26c5-11e7-896b-402f60a0f059.png) | war3map.w3s      |

### Object data files

| Type                    | Json → War  | War → Json  | File          |
|-------------------------|:-----------:|:-----------:|---------------|
| Units - Objects         | ![check](https://cloud.githubusercontent.com/assets/4079034/25298706/7a881946-26c5-11e7-896b-402f60a0f059.png) | ![check](https://cloud.githubusercontent.com/assets/4079034/25298706/7a881946-26c5-11e7-896b-402f60a0f059.png) | war3map.w3u     |
| Items - Objects         | ![check](https://cloud.githubusercontent.com/assets/4079034/25298706/7a881946-26c5-11e7-896b-402f60a0f059.png) | ![check](https://cloud.githubusercontent.com/assets/4079034/25298706/7a881946-26c5-11e7-896b-402f60a0f059.png) | war3map.w3t     |
| Abilities - Objects     | ![check](https://cloud.githubusercontent.com/assets/4079034/25298706/7a881946-26c5-11e7-896b-402f60a0f059.png) | ![check](https://cloud.githubusercontent.com/assets/4079034/25298706/7a881946-26c5-11e7-896b-402f60a0f059.png) | war3map.w3a     |
| Destructables - Objects | ![check](https://cloud.githubusercontent.com/assets/4079034/25298706/7a881946-26c5-11e7-896b-402f60a0f059.png) | ![check](https://cloud.githubusercontent.com/assets/4079034/25298706/7a881946-26c5-11e7-896b-402f60a0f059.png) | war3map.w3b     |
| Doodads - Objects       | ![check](https://cloud.githubusercontent.com/assets/4079034/25298706/7a881946-26c5-11e7-896b-402f60a0f059.png) | ![check](https://cloud.githubusercontent.com/assets/4079034/25298706/7a881946-26c5-11e7-896b-402f60a0f059.png) | war3map.w3d     |
| Upgrades - Objects      | ![check](https://cloud.githubusercontent.com/assets/4079034/25298706/7a881946-26c5-11e7-896b-402f60a0f059.png) | ![check](https://cloud.githubusercontent.com/assets/4079034/25298706/7a881946-26c5-11e7-896b-402f60a0f059.png) | war3map.w3q     |
| Buffs - Objects         | ![check](https://cloud.githubusercontent.com/assets/4079034/25298706/7a881946-26c5-11e7-896b-402f60a0f059.png) | ![check](https://cloud.githubusercontent.com/assets/4079034/25298706/7a881946-26c5-11e7-896b-402f60a0f059.png) | war3map.w3h     |

### Trigger files

| Type                    | Json → War  | War → Json  | File          |
|-------------------------|:-----------:|:-----------:|---------------|
| LUA                    | ![times](https://cloud.githubusercontent.com/assets/4079034/25298707/7a883642-26c5-11e7-841c-cd3eb1425461.png) | ![times](https://cloud.githubusercontent.com/assets/4079034/25298707/7a883642-26c5-11e7-841c-cd3eb1425461.png) | war3map.lua       |
| JASS                    | ![times](https://cloud.githubusercontent.com/assets/4079034/25298707/7a883642-26c5-11e7-841c-cd3eb1425461.png) | ![times](https://cloud.githubusercontent.com/assets/4079034/25298707/7a883642-26c5-11e7-841c-cd3eb1425461.png) | war3map.j       |
| Strings                 | ![check](https://cloud.githubusercontent.com/assets/4079034/25298706/7a881946-26c5-11e7-896b-402f60a0f059.png) | ![check](https://cloud.githubusercontent.com/assets/4079034/25298706/7a881946-26c5-11e7-896b-402f60a0f059.png) | war3map.wts     |



### Map files

| Type                    | Json → War  | War → Json  | File          |
|-------------------------|:-----------:|:-----------:|---------------|
| Info File               | ![check](https://cloud.githubusercontent.com/assets/4079034/25298706/7a881946-26c5-11e7-896b-402f60a0f059.png) | ![check](https://cloud.githubusercontent.com/assets/4079034/25298706/7a881946-26c5-11e7-896b-402f60a0f059.png) | war3map.w3i        |
| Imported Files          | ![check](https://cloud.githubusercontent.com/assets/4079034/25298706/7a881946-26c5-11e7-896b-402f60a0f059.png) | ![check](https://cloud.githubusercontent.com/assets/4079034/25298706/7a881946-26c5-11e7-896b-402f60a0f059.png) | war3map.imp        |
| Pathing                 | ![times](https://cloud.githubusercontent.com/assets/4079034/25298707/7a883642-26c5-11e7-841c-cd3eb1425461.png) | ![times](https://cloud.githubusercontent.com/assets/4079034/25298707/7a883642-26c5-11e7-841c-cd3eb1425461.png) | war3map.wpm        |
| Shadow map              | ![times](https://cloud.githubusercontent.com/assets/4079034/25298707/7a883642-26c5-11e7-841c-cd3eb1425461.png) | ![times](https://cloud.githubusercontent.com/assets/4079034/25298707/7a883642-26c5-11e7-841c-cd3eb1425461.png) | war3map.shd        |


### Not included
 ![times](https://cloud.githubusercontent.com/assets/4079034/25298707/7a883642-26c5-11e7-841c-cd3eb1425461.png) Custom Text Trigger File (war3map.wct)  
  ![times](https://cloud.githubusercontent.com/assets/4079034/25298707/7a883642-26c5-11e7-841c-cd3eb1425461.png) Trigger Names File (war3map.wtg)  
 ![times](https://cloud.githubusercontent.com/assets/4079034/25298707/7a883642-26c5-11e7-841c-cd3eb1425461.png) Menu Minimap (war3map.mmp)  
 ![times](https://cloud.githubusercontent.com/assets/4079034/25298707/7a883642-26c5-11e7-841c-cd3eb1425461.png) Minimap Image (war3mapMap.blp)  
 ![times](https://cloud.githubusercontent.com/assets/4079034/25298707/7a883642-26c5-11e7-841c-cd3eb1425461.png) Minimap Image (war3mapMap.b00  
 ![times](https://cloud.githubusercontent.com/assets/4079034/25298707/7a883642-26c5-11e7-841c-cd3eb1425461.png) Minimap Image (war3mapMap.tga)  
 ![times](https://cloud.githubusercontent.com/assets/4079034/25298707/7a883642-26c5-11e7-841c-cd3eb1425461.png) Map Preview Image (war3mapPreview.tga)

## Specification
We have a detailed [specification on our Wiki](https://github.com/ChiefOfGxBxL/WC3MapTranslator/wiki) explaining how to format a map in JSON. It explains everything from the high-level map object, all the way down to creating individual units, tiles, or custom objects.

The underlying WarCraft map files (e.g. war3map.doo) have been documented [on our Wiki](https://github.com/ChiefOfGxBxL/WC3MapTranslator/wiki) as well. If you are curious about how a .w3x file is composed, this is the place to learn!

## Contributing
We encourage contributions! Generally, the process of making a change is:
1. Fork this repo
2. Develop your changes on a new branch
3. Submit a pull request to `master`

**Your code should**:
 * **run** (your code needs to work, of course)
 * **include tests** (write unit tests to demonstrate your code works under different conditions)
 * **be linted** (run `npm run lint` and follow the project's coding standards)
 * **pass CI** (we enforce: ESLint, unit tests pass, code coverage)

A code review is required on your PR to be accepted into `master`. A project member will get back to you within one week. If you haven't heard from someone regarding your PR, feel free to ping @chiefofgxbxl.

## Special Thanks
We owe a lot of thanks to *Chocobo* on [TheHelper](http://www.thehelper.net/) for the detailed documentation of the files found in a .w3x archive. Two tutorials are [here (1)](http://www.thehelper.net/threads/guide-explanation-of-w3m-and-w3x-files.35292/) and [here (2)](http://world-editor-tutorials.thehelper.net/cat_usersubmit.php?view=42787).
