# Usage

**WC3MapTranslator** is an API that translates between the WC3 file format ("war3map") and JSON files. You can convert between the two.

WC3MapTranslator *does not*:
 - Read or write files for you - Use [`node:fs`](https://nodejs.org/docs/latest/api/fs.html) methods for this
 - Extract files from a WC3 map - Use [Ladiq's MPQ Editor](https://www.hiveworkshop.com/threads/ladiks-mpq-editor.249562/) or similar tools

Translators contain two methods:
  1. `jsonToWar(data)`, or in the case of ObjectsTranslator, `jsonToWar(type, data)`  
  Takes input JSON data, and converts it to a buffer containing native WarCraft III data
      ```json
      {
        "json": { ... },
        "errors": []
      }
      ```
  2. `warToJson(buffer)`, or in the case of ObjectsTranslator, `warToJson(type, buffer)`
  Takes input WarCraft III data as a buffer, and converts it to JSON format
      ```json
      {
        "buffer": <Buffer 00 00 00...>,
        "errors": []
      }
      ```

This library includes the following translators, with examples on how to use them linked below:

### World files

| Name                    | WarCraft III File | Translator        |
|-------------------------|-------------------|-------------------|
| Terrain                 |  war3map.w3e      | TerrainTranslator |
| Units (and items)       |  war3mapUnits.doo | UnitsTranslator   |
| Doodads                 |  war3map.doo      | DoodadsTranslator |
| Regions                 |  war3map.w3r      | RegionsTranslator |
| Cameras                 |  war3map.w3c      | CamerasTranslator |

### Object data files

| Name                    | WarCraft III File | Translator         |
|-------------------------|-------------------|--------------------|
| Units - Objects         |  war3map.w3u      | ObjectsTranslator* |
| Items - Objects         |  war3map.w3t      | ObjectsTranslator* |
| Abilities - Objects     |  war3map.w3a      | ObjectsTranslator* |
| Destructables - Objects |  war3map.w3b      | ObjectsTranslator* |
| Doodads - Objects       |  war3map.w3d      | ObjectsTranslator* |
| Upgrades - Objects      |  war3map.w3q      | ObjectsTranslator* |
| Buffs - Objects         |  war3map.w3h      | ObjectsTranslator* |

### Map files

| Name                    | WarCraft III File | Translator        |
|-------------------------|-------------------|-------------------|
| Info File               |  war3map.w3i      | InfoTranslator    |
| Imported Files          |  war3map.imp      | ImportsTranslator |
| Sounds (definitions)    |  war3map.w3s      | SoundsTranslator  |
| Strings (triggers)      |  war3map.wts      | StringsTranslator |

(*) The ObjectsTranslator takes an additional argument to its `jsonToWar` and `warToJson` methods to specify what type of object is being translated. There is a static string enum that can be accessed via `ObjectsTranslator.ObjectType.*`.

(*) When ObjectsTranslator requires you to provide a type, there are four choices:  
 * **String** - a series of characters
 * **Int** - a whole number
 * **Real** - signed real number (allows positive/negative)
 * **Unreal** - unsigned real number, aka *float* (positive values only)

This is typically seen in the Object translator when you're modifying an object's field. For instance, if you want to modify Holy Light's "amount healed", you'll need to specify not only the field name and new value, but also that the type is an *unreal*.

---

## Terrain


## Units (and items)
## Doodads
## Regions
## Cameras
## Units - Objects
## Items - Objects
## Abilities - Objects
## Destructables - Objects
## Doodads - Objects
## Upgrades - Objects
## Buffs - Objects
## Info
## Strings
## Imports
## Sounds
