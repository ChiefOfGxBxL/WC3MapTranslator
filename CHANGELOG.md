# 4.0.0 (2021-mm-dd)
## SUMMARY
**🔥 Breaking changes**
## FEATURES
 * Improved usage contract: 
   * Translators are now exported by this library (e.g. `import { ObjectTranslator } from 'wc3maptranslator'`)
   * Translators no longer need to be instantiated to be used
## FIXES
 * Resolve `[DEP0005] DeprecationWarning: Buffer()` warning in `HexBuffer.ts`
 * Fix scoping issues on `*Translator.ts`, `HexBuffer.ts` and `W3Buffer.ts` where certain fields that should be `private` were marked as `public`
## MAINTENANCE
 * Upgrade to Node 14.x LTS
 * Upgrade to npm 7.x
 * Upgrade `round-to` 4.1.0 -> 5.0.0
 * Upgrade `@types/fs-extra` 8.1.0 -> 9.0.7
 * Upgrade `@types/mocha` 7.0.1 -> 8.2.0
 * Upgrade `@types/node` 12.12.28 -> 14.14.27
 * Upgrade `fs-extra` 8.1.0 -> 9.1.0
 * Upgrade `mocha` 7.0.1 -> 8.3.0
 * Upgrade `nyc` 15.0.0 -> 15.1.0
 * Upgrade `ts-node` 8.6.2 -> 9.1.1
 * Upgrade `tslint` 6.0.0 -> 6.1.3
 * Upgrade `typescript` 3.8.2 -> 4.1.5
 * The project structure has changed:
    * `examples` sub-project directory is removed
    * Refer to `USAGE.md` for how to use the code
 * Add all contributors to `package.json`
## TESTING
 * Travis CI will now use Node 14 LTS to build the project
 * `test` directory now contains the WC3 and JSON data files the tests require
<!--
# x.y.z (YYYY-MM-DD)
## SUMMARY
**🔥 Breaking changes**
## FEATURES
## FIXES
## MAINTENANCE
## TESTING
-->

# Previous versions
The `CHANGELOG.md` file was introduced with the 4.x release. For details on previous changes, please refer to https://github.com/ChiefOfGxBxL/WC3MapTranslator/releases.