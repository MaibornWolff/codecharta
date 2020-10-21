import {AppSettings, DynamicSettings, FileSettings, TreeMapSettings} from "../../codeCharta.model";

export enum CustomViewMapSelectionMode {
    SINGLE = "SINGLE",
    MULTIPLE = "MULTIPLE",
    DELTA = "DELTA"
}
export interface CustomView {
    name: string
    mapSelectionMode: CustomViewMapSelectionMode,
    assignedMap: string
    mapChecksum: string
    customViewVersion: string

    stateSettings: {
        appSettings: AppSettings
        dynamicSettings: DynamicSettings
        fileSettings: FileSettings
        treeMap: TreeMapSettings
    }
}
