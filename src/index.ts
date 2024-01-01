//
// Translators
//

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
} from './translators';

export {
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
};

//
// CLI
//

const recognizedFileMappings = [
    { translator: CamerasTranslator, jsonFile: 'cameras.json', warFile: 'war3map.w3c' },
    { translator: DoodadsTranslator, jsonFile: 'doodads.json', warFile: 'war3map.doo' },
    { translator: ImportsTranslator, jsonFile: 'imports.json', warFile: 'war3map.imp' },
    { translator: InfoTranslator, jsonFile: 'info.json', warFile: 'war3map.w3i' },
    { translator: RegionsTranslator, jsonFile: 'regions.json', warFile: 'war3map.w3r' },
    { translator: SoundsTranslator, jsonFile: 'sounds.json', warFile: 'war3map.w3s' },
    { translator: StringsTranslator, jsonFile: 'strings.json', warFile: 'war3map.wts' },
    { translator: TerrainTranslator, jsonFile: 'terrain.json', warFile: 'war3map.w3e' },
    { translator: UnitsTranslator, jsonFile: 'units.json', warFile: 'war3mapUnits.doo' },
    { translator: ObjectsTranslator, jsonFile: 'obj-abilities.json', warFile: 'war3map.w3a', objType: 'abilities' },
    { translator: ObjectsTranslator, jsonFile: 'obj-buffs.json', warFile: 'war3map.w3h', objType: 'buffs' },
    { translator: ObjectsTranslator, jsonFile: 'obj-destructables.json', warFile: 'war3map.w3b', objType: 'destructables' },
    { translator: ObjectsTranslator, jsonFile: 'obj-doodads.json', warFile: 'war3map.w3d', objType: 'doodads' },
    { translator: ObjectsTranslator, jsonFile: 'obj-items.json', warFile: 'war3map.w3t', objType: 'items' },
    { translator: ObjectsTranslator, jsonFile: 'obj-units.json', warFile: 'war3map.w3u', objType: 'units' },
    { translator: ObjectsTranslator, jsonFile: 'obj-upgrades.json', warFile: 'war3map.w3q', objType: 'upgrades' }
];

import path from 'node:path';
import chalk from 'chalk';
import * as fs from 'fs-extra';
import { program } from 'commander';

program
    .name('wc3maptranslator')
    .description('Translate between war3map and json formats for WarCraft III .w3x maps');
    // .version(process.env.npm_package_version);

program
    .argument('<input-file>', 'The file to be translated')
    .argument('[output-file]', 'The output file to save the translated data to')
    .option('-f, --force', 'Force overwrite any existing output file', false)
    .configureOutput({
        outputError(str, write) {
            write(`${chalk.white.bold('⚔ WC3MapTranslator')} ${chalk.white.bgRed.bold(' ERROR ')}\n${chalk.gray(str)}`)
        }
    })
    .action((inputFile, outputFile, options) => {
        let fileMapper = null
        let method = '' // jsonToWar or warToJson

        // Check that input file exists
        const inputFileName = path.parse(inputFile).base
        const resolvedInputFile = path.resolve(inputFile)
        if (!fs.existsSync(resolvedInputFile)) {
            return program.error(`The input file provided (${resolvedInputFile}) does not exist! Please provide a valid input file to translate.`)
        }

        // Determine which mapper to use
        fileMapper = recognizedFileMappings.find((mapper) => mapper.jsonFile === inputFileName || mapper.warFile === inputFileName)
        if (fileMapper) {
            method = inputFileName === fileMapper.jsonFile ? 'jsonToWar' : 'warToJson'
        } else {
            return program.error('The program could not determine how to translate the input file based on its name.\nPlease use a standard file name.')
        }

        // If no output file path is provided, look up the default mapping
        let outputFileName = outputFile
        if (!outputFileName) {
            outputFileName = inputFileName === fileMapper.jsonFile ? fileMapper.warFile : fileMapper.jsonFile
        }

        // Raise an error if the output file already exists, and the force overwrite flag isn't activated
        const resolvedOutputFile = path.resolve(outputFileName)
        if (fs.existsSync(resolvedOutputFile) && !options.force) {
            return program.error(`An output file already exists by the provided path (${resolvedOutputFile}).\nIf you want to force override it, use the -f or --force flag.`)
        }

        // Perform the translation and save the file
        const inputFileData = method === 'jsonToWar' ? fs.readJSONSync(resolvedInputFile) : fs.readFileSync(resolvedInputFile)
        const result = fileMapper.translator === ObjectsTranslator ? fileMapper.translator[method](fileMapper.objType, inputFileData) : fileMapper.translator[method](inputFileData)
        fs.writeFileSync(resolvedOutputFile, result.buffer || JSON.stringify(result.json, null, 4))

        console.info(chalk.white.bold('⚔ WC3MapTranslator'), chalk.white.bgGreen.bold(' SUCCESS '))
        console.info(chalk.white.bold('  Input:'), inputFileName, chalk.gray(resolvedInputFile))
        console.info(chalk.white.bold('  Output:'), outputFileName, chalk.gray(resolvedOutputFile), !outputFile ? chalk.gray(`(Defaulted to ${outputFileName})`) : '')
        console.info(chalk.white.bold('  Method:'), `${fileMapper.translator.name}/${method} `)
    });

program.parse();
