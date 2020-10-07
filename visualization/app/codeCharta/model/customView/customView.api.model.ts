import {AppSettings, DynamicSettings, FileSettings, TreeMapSettings} from "../../codeCharta.model";

export interface CustomView {
    name: string
    mapName: string
    mapHash: string
    customViewVersion: string

    stateSettings: {
        appSettings: AppSettings
        dynamicSettings: DynamicSettings
        fileSettings: FileSettings
        treeMap: TreeMapSettings
    }
}