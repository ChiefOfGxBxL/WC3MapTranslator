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

### Why?
WC3MapTranslator is a module to convert a JSON representation of WarCraft III (.w3x) data to their `war3map` files. This module was created for use by Ice Sickle, the new-gen WC3 world editor. You are welcome to use this module for other projects.

*But still... why?* - You may wish to familiarize yourself with the Ice Sickle project. JSON is much easier for humans to read, compared to the byte format used by WC3 files. Of course, this does come with a trade-off: increased file size. But with increased storage today and cloud-hosting, this is no problem.

### Usage
```js
var Translator = require('wc3maptranslator'),
    mapJson = { // Refer to "Specification"
        units: [...],
        doodads: [...],
        ...
    };

// Translate the above map JSON to output files
var unitsTranslator = new Translator.Units("war3mapUnits.doo", mapJson.units);
unitsTranslator.write(); // output the specified file from our input JSON

// Or we can translate everything in the map at once
// Saving to the current directory
Translator.fromJson(mapJson, '.');
```

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

### Specification
We have an extensive [specification doc on our Wiki](https://github.com/ChiefOfGxBxL/WC3MapTranslator/wiki/Specification) to explain how to format a map in JSON. It explains everything from the high-level map object, all the way down to creating individual units, tiles, or custom objects.

### Contributing
(Section pending)

### Special Thanks
We owe a lot of thanks to *Chocobo* on [TheHelper.net](thehelper.net) for the detailed documentation of the files found in a .w3x archive. Two tutorials are [here (1)](http://www.thehelper.net/threads/guide-explanation-of-w3m-and-w3x-files.35292/) and [here (2)](http://world-editor-tutorials.thehelper.net/cat_usersubmit.php?view=42787).
