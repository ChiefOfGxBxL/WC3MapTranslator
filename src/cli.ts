#!/usr/bin/env node

import chalk from 'chalk';
import { Option, program } from 'commander';
import * as fs from 'fs-extra';
import path from 'node:path';
import { translatorMappings } from '.';
import { version } from '../package.json';
import { JsonResult, WarResult } from './CommonInterfaces';
import { ObjectsTranslator } from './translators';

const recognizedTranslators = translatorMappings.map((mapping) => mapping.name).filter((o) => o);
const recognizedObjectTypes = translatorMappings.map((mapping) => mapping.objectType).filter((o) => o);

program
    .name('wc3maptranslator')
    .description('Translate between war3map and json formats for WarCraft III .w3x maps')
    .version(version);

program
    .argument('[input-file]', 'The file to be translated')
    .argument('[output-file]', 'The output file to save the translated data to')
    .option('-f, --force', 'Force overwrite any existing output file', false)
    .option('-l, --list', 'List available translators', false)
    .option('-t, --translator <translator>', 'Specify which translator to use (if unable to auto-detect based on file name)')
    .option('-o, --obj-type <obj-type>', 'Specify which type of object is being translated (if using ObjectsTranslator and unable to detecth based on file name)')
    .option('-s, --silent', 'If true, will not print success message details (errors are still printed)', false)
    .addOption(new Option('-m, --method <method>', 'Which direction to translate in (if unable to auto-detect based on file name)').choices(['warToJson', 'jsonToWar']))
    .configureOutput({
        outputError(str, write) {
            write(`${chalk.white.bold('⚔ WC3MapTranslator')} ${chalk.white.bgRed.bold(' ERROR ')}\n${chalk.gray(str)}\n${chalk.gray('Need help? Use -h or --help')}`);
        }
    })
    .action((inputFile, outputFile, options) => {
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

        if (!inputFile) {
            return program.error('No input file was provided to translate.\nPlease provide a valid input file to translate.');
        }

        if (options.translator && !recognizedTranslators.includes(options.translator)) {
            return program.error('Unknown translator provided. Refer to --list for available translators.');
        }

        if (options.translator === 'objects' && !options.objType) {
            return program.error('When using the ObjectsTranslator, the object type must be specified using -o or --obj-type.');
        }

        if (options.translator === 'objects' && !recognizedObjectTypes.includes(options.objType)) {
            return program.error('Unknown object type provided. Refer to --list for available object types.');
        }

        if (options.objType && options.translator !== 'objects') {
            return program.error('The object type flag can only be specified when using the ObjectsTranslator. Remove -o or --obj-type to continue.');
        }

        let fileMapper = null;
        let method = ''; // jsonToWar or warToJson

        // Check that input file exists
        const inputFileName = path.parse(inputFile).base
        const resolvedInputFile = path.resolve(inputFile)
        if (!fs.existsSync(resolvedInputFile)) {
            return program.error(`The input file provided (${resolvedInputFile}) does not exist!\nPlease provide a valid input file to translate.`);
        }

        // Determine which mapper to use
        //  (1) User specified via translator parameter
        //  (2) Auto-detect
        if (options.translator) {
            let mapperCandidates = translatorMappings.filter((mapper) => mapper.name === options.translator);
            if (options.translator === 'objects') mapperCandidates = mapperCandidates.filter((mapper) => mapper.objectType === options.objType);
            fileMapper = mapperCandidates[0];
        } else {
            fileMapper = translatorMappings.find((mapper) => mapper.jsonFile === inputFileName || mapper.warFile === inputFileName);
            if (!fileMapper) {
                return program.error('The program could not determine how to translate the input file based on its name.\nPlease specify which translator to use via -t or --translator, or use a standard file name.');
            }
        }

        // Determine which method to use
        if (inputFileName === fileMapper.jsonFile) {
            method = 'jsonToWar';
        } else if (inputFileName === fileMapper.warFile) {
            method = 'warToJson';
        } else if (options.method) {
            method = options.method;
        } else {
            return program.error('The program could not determine which direction to translate.\nPlease specify which method to use via -m or --method, or use a standard file name.');
        }

        // If no output file path is provided, look up the default mapping,
        // and resolve to the directory of the input path
        let outputFileName = outputFile;
        if (!outputFileName) {
            outputFileName = method === 'jsonToWar' ? fileMapper.warFile : fileMapper.jsonFile;
            outputFileName = path.resolve(path.dirname(inputFile), outputFileName);
        }

        // Raise an error if the output file already exists, and the force overwrite flag isn't activated
        const resolvedOutputFile = path.resolve(outputFileName);
        if (fs.existsSync(resolvedOutputFile) && !options.force) {
            return program.error(`An output file already exists by the provided path (${resolvedOutputFile}).\nIf you want to force override it, use the -f or --force flag.`);
        }

        // Perform the translation and save the file
        const inputFileData = method === 'jsonToWar' ? fs.readJSONSync(resolvedInputFile) : fs.readFileSync(resolvedInputFile);
        const translatorMethod = method === 'jsonToWar' ? fileMapper.translator.jsonToWar : fileMapper.translator.warToJson;
        const result = fileMapper.translator === ObjectsTranslator
            ? translatorMethod(fileMapper.objectType, inputFileData)
            : translatorMethod(inputFileData);

        fs.writeFileSync(resolvedOutputFile, method === 'jsonToWar' ? ((result as WarResult).buffer) : JSON.stringify((result as JsonResult).json, null, 2));

        if (!options.silent) {
            console.info(chalk.white.bold('⚔ WC3MapTranslator'), chalk.white.bgGreen.bold(' SUCCESS '));
            console.info(chalk.white.bold('  Input:'), inputFileName, chalk.gray(resolvedInputFile));
            console.info(chalk.white.bold('  Output:'), outputFileName, chalk.gray(resolvedOutputFile), !outputFile ? chalk.gray(`(Defaulted to ${outputFileName})`) : '');
            console.info(chalk.white.bold('  Translator:'), `${(<any>fileMapper.translator).name}`, !options.translator ? chalk.gray('(Auto-detected based on file name)') : '');
            console.info(chalk.white.bold('  Method:'), `${method}`, !options.method ? chalk.gray('(Auto-detected based on file name)') : '');
        }
    });

program.parse();
