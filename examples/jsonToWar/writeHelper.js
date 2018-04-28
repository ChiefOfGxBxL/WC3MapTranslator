const
    fs = require('fs'),
    Path = require('path'),
    warFileLookup = {
        Entity: {
            Camera:     'war3map.w3c',
            Doodad:     'war3map.doo',
            Region:     'war3map.w3r',
            Sound:      'war3map.w3s',
            Terrain:    'war3map.w3e',
            Unit:       'war3mapUnits.doo'
        },
        Object: {
            Ability:        'war3map.w3a',
            Buff:           'war3map.w3h',
            Destructable:   'war3map.w3b',
            Doodad:         'war3map.w3d',
            Item:           'war3map.w3t',
            Unit:           'war3map.w3u',
            Upgrade:        'war3map.w3q'
        },
        Other: {
            Import:     'war3map.imp',
            Info:       'war3map.w3i',
            String:     'war3map.wts'
        }
    };

/**
 * writeBufferToFile - Writes a given buffer from a translator to a war3map file
 *
 * @param  {String} warMapFile war3map file name and extension
 * @param  {Buffer} buffer     Buffer from translation to write
 * @return {Undefined}
 */
function writeBufferToFile(warMapFile, buffer) {
    const fullPathToWrite = Path.resolve('./output', warMapFile);
    let fd = fs.openSync(fullPathToWrite, 'w+');

    fs.writeSync(fd, buffer, 0, buffer.length);
    fs.closeSync(fd); // Must close file descriptor once done to prevent locking!

    return;
}

module.exports = {
    WarFile: warFileLookup,
    Write: writeBufferToFile
};
