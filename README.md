<p align='center'>
  <b>WC3MapTranslator</b>
</p>
<p align='center'>
  Module to translate JSON map format to WC3 (war3map) files for .w3x
</p>

<hr/>
<p align='center'>
  <a href="#why"><strong>Why?</strong></a> &middot;
  <a href="#usage"><strong>Usage</strong></a> &middot;
  <a href="#file-support"><strong>File Support</strong></a> &middot;
  <a href="#specification"><strong>Specification</strong></a> &middot;
  <a href="#contributing"><strong>Contributing</strong></a> &middot;
  <a href="#special-thanks"><strong>Special Thanks</strong></a>
</p>
<hr/>

<br/>

### Why?
WC3MapTranslator is a module to convert a JSON representation of WarCraft III (.w3x) data to their `war3map` files. This module was created for use by Ice Sickle, the new-gen WC3 world editor. You are welcome to use this module for other projects.

*But still... why?* - You may wish to familiarize yourself with the Ice Sickle project. JSON is much easier for humans to read, compared to the byte format used by WC3 files. Of course, this does come with a trade-off: increased file size. But with increased storage today and cloud-hosting, this is no problem.

<br/>

### Usage
```js
var Translator = require('wc3maptranslator'),
    mapJson = { // Refer to "Specification"
        units: [...],
        doodads: [...],
        ...
    };

// Translate the entire map, creating all files that it can
// from the given JSON. No path is specified (2nd param), so
// files are written to the current working directory.
Translator.fromJson(mapJson);

// We can also translate individual sections of JSON
// by using a single translator, available at Translator.XYZ,
// where XYZ is the name of the translator.
var unitsTranslator = new Translator.Units(mapJson.units);
unitsTranslator.write(); // output the specified file from our input JSON
```

<br/>

### File Support

| Type            | Status      | File          |
|-----------------|:-----------:|---------------|
| Doodads         | ![check](https://cloud.githubusercontent.com/assets/4079034/25298706/7a881946-26c5-11e7-896b-402f60a0f059.png)   | war3map.doo   |
| Strings         | ![check](https://cloud.githubusercontent.com/assets/4079034/25298706/7a881946-26c5-11e7-896b-402f60a0f059.png)   | war3map.wts   |
| Terrain         | ![check](https://cloud.githubusercontent.com/assets/4079034/25298706/7a881946-26c5-11e7-896b-402f60a0f059.png)   | war3map.w3e   |
| Units           | ![check](https://cloud.githubusercontent.com/assets/4079034/25298706/7a881946-26c5-11e7-896b-402f60a0f059.png)   | war3mapUnits.doo   |
| JASS            | ![times](https://cloud.githubusercontent.com/assets/4079034/25298707/7a883642-26c5-11e7-841c-cd3eb1425461.png)   | war3map.j   |
| Menu Minimap    | ![times](https://cloud.githubusercontent.com/assets/4079034/25298707/7a883642-26c5-11e7-841c-cd3eb1425461.png)   | war3map.mmp   |
| Shadow map      | ![times](https://cloud.githubusercontent.com/assets/4079034/25298707/7a883642-26c5-11e7-841c-cd3eb1425461.png)   | war3map.shd   |
| Info File       | ![times](https://cloud.githubusercontent.com/assets/4079034/25298707/7a883642-26c5-11e7-841c-cd3eb1425461.png)   | war3map.w3i   |
| Pathing         | ![times](https://cloud.githubusercontent.com/assets/4079034/25298707/7a883642-26c5-11e7-841c-cd3eb1425461.png)   | war3map.wpm   |
| Minimap Image   | ![times](https://cloud.githubusercontent.com/assets/4079034/25298707/7a883642-26c5-11e7-841c-cd3eb1425461.png)   | war3mapMap.blp   |
| Units - Objects         | ![times](https://cloud.githubusercontent.com/assets/4079034/25298707/7a883642-26c5-11e7-841c-cd3eb1425461.png)   | war3map.w3u   |
| Items - Objects         | ![times](https://cloud.githubusercontent.com/assets/4079034/25298707/7a883642-26c5-11e7-841c-cd3eb1425461.png)   | war3map.w3t   |
| Destructables - Objects | ![times](https://cloud.githubusercontent.com/assets/4079034/25298707/7a883642-26c5-11e7-841c-cd3eb1425461.png)   | war3map.w3b   |
| Doodads - Objects       | ![times](https://cloud.githubusercontent.com/assets/4079034/25298707/7a883642-26c5-11e7-841c-cd3eb1425461.png)   | war3map.w3d   |
| Abilities - Objects     | ![times](https://cloud.githubusercontent.com/assets/4079034/25298707/7a883642-26c5-11e7-841c-cd3eb1425461.png)   | war3map.w3a   |
| Buffs - Objects         | ![times](https://cloud.githubusercontent.com/assets/4079034/25298707/7a883642-26c5-11e7-841c-cd3eb1425461.png)   | war3map.w3h   |
| Upgrades - Objects      | ![times](https://cloud.githubusercontent.com/assets/4079034/25298707/7a883642-26c5-11e7-841c-cd3eb1425461.png)   | war3map.w3q   |

<br/>

### Specification
We have an extensive [specification on our Wiki](https://github.com/ChiefOfGxBxL/WC3MapTranslator/wiki/Specification) explaining how to format a map in JSON. It explains everything from the high-level map object, all the way down to creating individual units, tiles, or custom objects.

The underlying WarCraft map files (e.g. war3map.doo) have been documented [on our Wiki](https://github.com/ChiefOfGxBxL/WC3MapTranslator/wiki) as well. If you are curious about how a .w3x file is composed, this is the place to learn!

<br/>

### Contributing
(Section pending)

<br/>

### Special Thanks
We owe a lot of thanks to *Chocobo* on [TheHelper.net](thehelper.net) for the detailed documentation of the files found in a .w3x archive. Two tutorials are [here (1)](http://www.thehelper.net/threads/guide-explanation-of-w3m-and-w3x-files.35292/) and [here (2)](http://world-editor-tutorials.thehelper.net/cat_usersubmit.php?view=42787).
