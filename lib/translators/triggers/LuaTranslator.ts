// nothing here

interface LuaFiles {
    PathList: string[];
}

export class LuaTranslator {
    public _files: LuaFiles;

    constructor(paths: string[]) {
        this._files = {
            PathList: paths
        };
    }
}
