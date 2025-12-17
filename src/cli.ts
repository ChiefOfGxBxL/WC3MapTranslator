#!/usr/bin/env node

import chalk from 'chalk';
import { program } from 'commander';
import * as fs from 'fs-extra';
import path from 'node:path';
import { version } from '../package.json';
import { JsonResult, WarResult } from './CommonInterfaces';
import { ObjectsTranslator } from './index';
import translatorMappings from './TranslatorMappings';

const knownWarFiles = translatorMappings.map((mapping) => mapping.warFile);
const knownJsonFiles = translatorMappings.map((mapping) => mapping.jsonFile);

const isDirectory = (path: string) => fs.existsSync(path) && fs.statSync(path).isDirectory();

enum Method {
    warToJson = 1,
    jsonToWar = 2
}

program
    .name('wc3maptranslator')
    .description('Translate between war3map and json formats for WarCraft III .w3x maps')
    .version(version);

program
    .argument('<input>', 'The input file or directory to be translated')
    .argument('[output]', 'The output file or directory to save the translated data to')
    .option('-l, --list', 'list available translators', false)
    .option('-f, --force', 'force overwrite any existing output file', false)
    .option('-s, --silent', 'if specified, do not print success message details (errors are still printed)', false)
    .option('-w, --toWar', 'translate the provided input into a WC3 binary file')
    .option('-j, --toJson', 'translate the provided input into a JSON file')
    .configureOutput({
        outputError(str, write) {
            write(`${chalk.white.bold('⚔ WC3MapTranslator')} ${chalk.white.bgRed.bold(' ERROR ')}\n${chalk.gray(str)}\n${chalk.gray('Need help? Use -h or --help')}\n`);
        }
    })
    .action((inputPath, outputPath, options) => {
        // Check that input file or directory exists
        const resolvedInputFile = path.resolve(inputPath)
        if (!fs.existsSync(resolvedInputFile)) {
            return program.error(`The input provided (${resolvedInputFile}) does not exist!\nPlease provide a valid file or directory to translate.`);
        }

        if (options.list) {
            console.info(chalk.white('Available translators:'))
            console.table(translatorMappings.map((entry) => ({
                Name: entry.name,
                Translator: (<any>entry.translator).name,
                'JSON File (default)': entry.jsonFile,
                'War File (default)': entry.warFile,
                'Object Type': entry.objectType
            })));
            return;
        }

        const isInputDirectory = isDirectory(inputPath);
        const isOutputDirectory = outputPath && isDirectory(outputPath);

        /*
         * Options validation
         */
        if (isInputDirectory && outputPath && !isOutputDirectory) {
            return program.error('If input directory is specified, output must be a directory too.')
        }

        if (isInputDirectory && !options.toWar && !options.toJson) {
            return program.error('Either --toWar (-w) or --toJson (-j) must be specified when input is a directory.')
        }

        if (options.toWar && options.toJson) {
            return program.error('Cannot use --toWar (-w) and --toJson (-j) at the same time. Choose one flag.')
        }

        if ((options.toWar || options.toJson) && !isInputDirectory) {
            return program.error('Cannot use --toWar (-w) or --toJson (-j) when input is not a directory.')
        }


        /*
         * Process input
         */
        const fileNamesToTranslate = isInputDirectory
            ? (options.toWar ? knownJsonFiles : knownWarFiles) // TODO
            : [path.parse(inputPath).base];

        for (const nameOfFileToTranslate of fileNamesToTranslate) {
            const inputFile = isInputDirectory ? path.resolve(inputPath, nameOfFileToTranslate) : resolvedInputFile;
            if (isInputDirectory && !fs.existsSync(inputFile)) {
                continue;
            }

            const fileMapper = translatorMappings.find((mapper) => [mapper.jsonFile, mapper.warFile].includes(nameOfFileToTranslate));
            if (!fileMapper) {
                return program.error('The provided input file is not a standard name for either a war3map file or JSON file.\nPlease use a standard file name as shown in the --list (-l) command.');
            }

            const method = isInputDirectory
                ? (options.toWar ? Method.jsonToWar : Method.warToJson) // directory mode, so must specify
                : (nameOfFileToTranslate === fileMapper!.jsonFile ? Method.jsonToWar : Method.warToJson); // auto-detected based on file name

            // If no output file path is provided, look up the default mapping,
            // and resolve to the directory of the input path
            let outputFilePath = '';
            let defaultOutputFileName = '';
            if (!outputPath) {
                const mappedFileName = method === Method.jsonToWar ? fileMapper.warFile : fileMapper.jsonFile;
                defaultOutputFileName = mappedFileName;
                outputFilePath = path.resolve(isInputDirectory ? inputPath : path.dirname(inputPath), mappedFileName);
            }

            // Raise an error if the output file already exists and the force-overwrite flag isn't activated
            if (!options.force && fs.existsSync(outputFilePath)) {
                if (isInputDirectory) {
                    // In directory mode, skip file instead of exiting application so other files can still be processed
                    console.info(
                        chalk.white.bold('⚔ WC3MapTranslator'),
                        chalk.white.bgYellow.bold(' SKIP '),
                        nameOfFileToTranslate, '→',
                        defaultOutputFileName,
                        chalk.gray(`(already exists, use --force (-f) to overwrite)`)
                    );
                    continue;
                } else {
                    return program.error(`An output file already exists by the provided path (${outputFilePath}).\nIf you want to force overwrite it, use the --force (-f) flag.`);
                }
            }

            // Perform the translation and save the file
            const inputFileData = method === Method.jsonToWar ? fs.readJSONSync(inputFile) : fs.readFileSync(inputFile);
            const translatorMethod = method === Method.jsonToWar ? fileMapper.translator.jsonToWar : fileMapper.translator.warToJson;
            const result = fileMapper.translator === ObjectsTranslator
                ? translatorMethod(fileMapper.objectType, inputFileData)
                : translatorMethod(inputFileData);

            fs.writeFileSync(
                outputFilePath,
                method === Method.jsonToWar
                    ? ((result as WarResult).buffer)
                    : JSON.stringify((result as JsonResult).json, null, 2)
            );

            if (!options.silent) {
                console.info(
                    chalk.white.bold('⚔ WC3MapTranslator'),
                    chalk.white.bgGreen.bold(' SUCCESS '),
                    nameOfFileToTranslate, // resolvedInputFile
                    '→',
                    defaultOutputFileName, // outputFilePath
                    chalk.gray(`(using ${(<any>fileMapper.translator).name})`)
                );
            }
        }
    });

program.parse();
