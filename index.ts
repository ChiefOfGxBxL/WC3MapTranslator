import { DoodadsTranslator, StringsTranslator, TerrainTranslator, UnitsTranslator, RegionsTranslator, CamerasTranslator, SoundsTranslator, ObjectsTranslator, ImportsTranslator, InfoTranslator } from './lib/translators';


export class Translator {
    public Doodads: DoodadsTranslator = new DoodadsTranslator();
    public Strings: StringsTranslator = new StringsTranslator();
    public Terrain: TerrainTranslator = new TerrainTranslator();
    public Units: UnitsTranslator = new UnitsTranslator();
    public Regions: RegionsTranslator = new RegionsTranslator();
    public Cameras: CamerasTranslator = new CamerasTranslator();
    public Sounds: SoundsTranslator = new SoundsTranslator();

    public Objects: ObjectsTranslator = new ObjectsTranslator();

    public Imports: ImportsTranslator = new ImportsTranslator();
    public Info: InfoTranslator = new InfoTranslator();

    constructor() {
    }
}
