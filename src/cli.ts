#!/usr/bin/env node

/* eslint-disable no-console */

import chalk from 'chalk';
import { program } from 'commander';
import * as fs from 'fs-extra';
import path from 'node:path';
import { version } from '../package.json';
import { JsonResult, WarResult, ITranslator } from './CommonInterfaces';
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
        const resolvedInputFile = path.resolve(inputPath);
        if (!fs.existsSync(resolvedInputFile)) {
            return program.error(`The input provided (${resolvedInputFile}) does not exist!\nPlease provide a valid file or directory to translate.`);
        }

        if (options.list) {
            console.info(chalk.white('Available translators:'));
            console.table(translatorMappings.map((entry) => ({
                Name: entry.name,
                Translator: (entry.translator as any).name, // eslint-disable-line @typescript-eslint/no-explicit-any
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
            return program.error('If input directory is specified, output must be a directory too (or output directory might not exist).');
        }

        if (isInputDirectory && !options.toWar && !options.toJson) {
            return program.error('Either --toWar (-w) or --toJson (-j) must be specified when input is a directory.');
        }

        if (options.toWar && options.toJson) {
            return program.error('Cannot use --toWar (-w) and --toJson (-j) at the same time. Choose one flag.');
        }

        if ((options.toWar || options.toJson) && !isInputDirectory) {
            return program.error('Cannot use --toWar (-w) or --toJson (-j) when input is not a directory.');
        }

        const writeFile = (inputFile: string, outputFile: string, data: string | Buffer, translator: ITranslator) => {
            // Raise an error if the output file already exists and the force-overwrite flag isn't activated
            if (!options.force && fs.existsSync(outputFile)) {
                console.info(
                    chalk.white.bold('⚔ WC3MapTranslator'),
                    chalk.white.bgYellow.bold(' SKIP '),
                    inputFile, '→',
                    path.basename(outputFile),
                    chalk.gray(`(already exists, use --force (-f) to overwrite)`)
                );
            } else if (!options.silent) {
                fs.writeFileSync(outputFile, data);

                console.info(
                    chalk.white.bold('⚔ WC3MapTranslator'),
                    chalk.white.bgGreen.bold(' SUCCESS '),
                    inputFile,
                    '→',
                    path.basename(outputFile),
                    chalk.gray(`(using ${(translator as any).name})`) // eslint-disable-line @typescript-eslint/no-explicit-any
                );
            }
        };

        /*
         * Process input
         */
        const fileNamesToTranslate = isInputDirectory
            ? (options.toWar ? knownJsonFiles : knownWarFiles)
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
                : (nameOfFileToTranslate === fileMapper.jsonFile ? Method.jsonToWar : Method.warToJson); // auto-detected based on file name

            // If no output file path is provided, look up the default mapping,
            // and resolve to the directory of the input path
            let outputFilePath = '';
            let defaultOutputFileName = '';
            const mappedFileName = method === Method.jsonToWar ? fileMapper.warFile : fileMapper.jsonFile;
            defaultOutputFileName = mappedFileName;
            outputFilePath = isOutputDirectory
                ? path.resolve(outputPath, mappedFileName)
                : path.resolve(isInputDirectory ? inputPath : path.dirname(inputPath), mappedFileName);

            // Perform the translation and save the file
            const isDestructableTranslator = fileMapper.translator === ObjectsTranslator && fileMapper.objectType === ObjectsTranslator.ObjectType.Destructables;
            const inputFileData = method === Method.jsonToWar ? fs.readJSONSync(inputFile) : fs.readFileSync(inputFile);
            const translatorMethod = method === Method.jsonToWar ? fileMapper.translator.jsonToWar : fileMapper.translator.warToJson;

            let skinInputFileData = undefined;
            if (isDestructableTranslator && method === Method.warToJson) {
                let skinDestructableFilePath = path.resolve(path.dirname(inputPath), 'war3mapSkin.w3b');
                if (fs.existsSync(skinDestructableFilePath)) {
                    skinInputFileData = fs.readFileSync(skinDestructableFilePath);
                }
            }

            const result = fileMapper.translator === ObjectsTranslator
                ? translatorMethod(fileMapper.objectType, inputFileData, skinInputFileData)
                : translatorMethod(inputFileData);

            writeFile(
                nameOfFileToTranslate,
                outputFilePath,
                method === Method.jsonToWar
                    ? ((result as WarResult).buffer)
                    : JSON.stringify((result as JsonResult).json, null, 2),
                fileMapper.translator
            );

            // Possible "Skin" file for destructables, json -> war3map
            if (isDestructableTranslator && method === Method.jsonToWar && (result as WarResult).bufferSkin) {
                writeFile(
                    nameOfFileToTranslate,
                    path.resolve(path.dirname(outputFilePath), 'war3mapSkin.w3b'),
                    (result as WarResult).bufferSkin!,
                    fileMapper.translator
                );
            }
        }
    });

program.parse();
