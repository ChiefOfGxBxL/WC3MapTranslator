// nothing here

interface JassFiles {
    PathList: string[];
}

export class JassTranslator {
    public _files: JassFiles;

    constructor(paths: string[]) {
        this._files = {
            PathList: paths
        };
    }
}
