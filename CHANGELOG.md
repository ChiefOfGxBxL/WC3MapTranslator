# ___ (2025-12-__)
### SUMMARY
**🔥 Breaking changes**

This release includes several breaking changes:
 * 🔥 The `strings.json` file format now maps keys to `{ value: "", comment: "" }` to support string comments (see below for details)
 * 🔥 The `sounds.json` file has renamed the `eax` field to `effect`, and the `flags` adds a new `imported` boolean
 * 🔥 The `imports.json` file uses an array of strings to list imports (no longer using objects)
 * 🔥 The `units.json` file now expresses angles in degrees (not radians, as before)

The compiled target version is now `es2015`, up from `es5` (Node has supported the vast majority of `es2015` features since around v6). This allows the codebase to take advantage of new TypeScript features.

### FEATURES
 * Units
    * Add support for random units/items/buildings
    * Add support for dropped item sets
    * Add waygate capability
 * Objects - Add support for latest object files version, v3
 * Sounds
   * Statically exposes `EffectType` and `Channel`, so you can easily reference values like `Channel.Constructions` (12) or `EffectType.HeroSpeech` ("HeroAcksEAX")
   * Add support for two previously-unknown fields: `pitchVariance` and `priority`
 * 🔥 Doodads
   * Add support for item tables (both map-defined and custom)
   * Add support for special doodads
   * JSON file format change:
      ```js
        // doodads.json (BEFORE)
        [ {}, {}, {} ]

        {
          // doodads.json (AFTER)
          "regular": [ {}, {}, {} ],
          "special": [ {} ]
        }
      ```
 * 🔥 Imports
   * Removes need to prefix path by "war3mapImported/" if missing, since latest WC3 version "Asset Manager" gets rid of custom paths
### FIXES
 * Fixes round-trip conversions (war3 -> json -> war3) on a number of translators:
   * 🔥 Strings: now supports string comments, thus requiring a new JSON format:
      ```js
        {
          // strings.json (BEFORE)
          "1591": "|cffFF3333Victory Count|r:",
          "1592": "|cff3333FFRepick Available|r:"
        }

        {
          // strings.json (AFTER)
          "1591": { "value": "CustomUnit1", "comment": "// Units: H000 (CustomUnit1), Name (Name)" },
          "1592": { "value": "|cff3333FFRepick Available|r:" }
        }
      ```
   * Regions: properly handles null weather effect 0x0 bytes
   * Cameras: handles new local roll, pitch, yaw fields, and discovers previous magic value for near clipping
   * Sounds: resolved many issues including magic numbers, default pitch, internal name prefixing `gg_snd_`
   * Doodads: handles item tables and special doodads
### MAINTENANCE
 * Upgrade to NodeJS v24 (LTS)
 * Upgrade `fs-extra` 9.1.0 -> 11.3.2
 * Upgrade `@types/fs-extra` 9.0.7 -> 11.0.4
 * Upgrade `@types/node` 14.14.31 -> 24.10.1
 * Upgrade `round-to` 5.0.0 -> 7.0.0
 * Remove `diff-buf` (use native `buffer.equals(buf)`)
 * Remove `@types/round-to` (`round-to` includes its own type definition)
 * Remove `mocha` (use native Node test runner)
 * Remove `@types/mocha`
 * Remove `nyc`
 * Remove `istanbul`
 * Remove `@istanbuljs/nyc-config-typescript`
 * Switch `tslint` (deprecated) to `eslint`
### TESTING
 * Fix the test suite, which was broken since upgrading to TypeScript
 * Add tests for round-tripping `war3map` files to JSON and back
 * Use native `node --test` functionality in NodeJS 24, removing need for 3rd party test runner `mocha`

# 4.0.4 (2023-08-06)
### SUMMARY
### FIXES
 * Resolve files packaged incorrectly when publishing npm

# 4.0.3 (2023-08-06)
### FIXES
 * Fix dependency `ieee754` being listed as devDependency instead of regular dependency, breaking some translators

# 4.0.2 (2023-08-06)
### FIXES
 * Fix build issues from previous release

# 4.0.1 (2023-08-06)
### FIXES
 * Project properly builds all TS files upon installation, resolving out-of-the-box errors

# 4.0.0 (2021-02-28)
### SUMMARY
**🔥 Breaking changes**

This major release significantly overhauls WC3MapTranslator since the release of WarCraft III: Reforged. There are a few breaking changes in this release.

The two largest changes include a new usage contract and changes to the terrain `.json` format, both of which are detailed below. This release also integrates the latest file formats, after a few changes to the war3map formats to support Reforged.

The old usage contract meant that developers had to instantiate translators, which didn't make much sense. Now translators are static classes that can be used directly after importing.

The `.json` format for terrain gets rid of the bulky `tile` objects and returns to a one-dimensional mask array for things like ground height, boundary flags, etc. In an older version of WC3MapTranslator, terrain used to be a multi-dimensional array of rows, followed by the `tile` object format. The problems with the `tile` object format were two-fold: (1) file size would blow up (e.g. a 29kB `.w3e` file would become a 1199kB `.json` terrain file); and (2) the bulky `tile` objects did not lend themselves to the spirit of having a diff-able JSON file. We believe that a single-dimensional array will allow developers to more easily see differences between JSONs.

Another exciting change is a new [WC3MapSpecification](https://github.com/ChiefOfGxBxL/WC3MapSpecification) repository for documenting the war3map specifications. This is a living document, meaning it may be updated in-place as our understanding of the file formats improves!

### FEATURES
 * 🔥 Improve usage contract:
   * Translators are now exported by this library (e.g. `import { ObjectTranslator } from 'wc3maptranslator'`)
   * Translators no longer need to be instantiated to be used
 * 🔥 Change terrain format:
   * Tiles are now defined via "masks", for ground height, texture, variation, etc.
     * Before: `tiles` is an array of objects... `{ groundHeight, waterHeight, boundaryFlag, flags, groundTexture, groundVariation, cliffVariation, cliffTexture, layerHeight }`
     * After: a one-dimensional array for each of the above fields... e.g. for a 64x64 map, `groundHeight` is an array of 65*65=4225 tile points
   * Some fields have been renamed into camelCase for consistency:
     * `customtileset` -> `customTileset`
     * `tilepalette` -> `tilePalette`
     * `clifftilepalette` -> `cliffTilePalette`
 * Upgrade to latest file formats
   * Sounds version upgraded from `1` -> `3`
   * Info version upgraded from `25` -> `31`
 * Add more type safety:
   * Translator results from `jsonToWar()` and `warToJson()` are now typed by `WarResult` and `JsonResult`, respectively
   * `JsonResult` is generically typed to describe what it contains (e.g. `Sound[]`)
   * Introduced new `angle` type, which is an alias for `number`; `angle`'s should always be specified in degrees, not radians
### FIXES
 * Resolve `[DEP0005] DeprecationWarning: Buffer()` warning in `HexBuffer.ts`
 * Fix scoping issues on `*Translator.ts`, `HexBuffer.ts` and `W3Buffer.ts` where certain fields that should be `private` were marked as `public`
 * Fix InfoTranslator reading random item table ID length as 1 instead of 4
 * Fix potential null-terminator errors related to string or character-array fields
### MAINTENANCE
 * Upgrade to Node 14.x LTS
 * Upgrade to npm 7.x
 * Upgrade `round-to` 4.1.0 -> 5.0.0
 * Upgrade `@types/fs-extra` 8.1.0 -> 9.0.7
 * Upgrade `@types/mocha` 7.0.1 -> 8.2.1
 * Upgrade `@types/node` 12.12.28 -> 14.14.31
 * Upgrade `fs-extra` 8.1.0 -> 9.1.0
 * Upgrade `mocha` 7.0.1 -> 8.3.0
 * Upgrade `nyc` 15.0.0 -> 15.1.0
 * Upgrade `ts-node` 8.6.2 -> 9.1.1
 * Upgrade `tslint` 6.0.0 -> 6.1.3
 * Upgrade `typescript` 3.8.2 -> 4.2.2
 * The project structure has changed:
    * `examples` sub-project directory is removed
    * Refer to `USAGE.md` for how to use the code
 * Add all contributors to `package.json`
 * Resolve all security issues via `npm audit fix` (5 low, 1 high, 1 critical)
### TESTING
 * Travis CI will now use Node 14 LTS to build the project
 * `test` directory now contains the WC3 and JSON data files the tests require
 * Implement the StringsTranslator test
 * Resolve all broken unit tests, most of them being reversion tests
<!--
# x.y.z (YYYY-MM-DD)
### SUMMARY
**🔥 Breaking changes**
### FEATURES
### FIXES
### MAINTENANCE
### TESTING
-->

# Previous versions
The `CHANGELOG.md` file was introduced with the 4.x release. For details on previous changes, please refer to https://github.com/ChiefOfGxBxL/WC3MapTranslator/releases.
