import { AppSettings, DynamicSettings, FileSettings, TreeMapSettings } from "../../codeCharta.model"

export enum CustomViewMapSelectionMode {
	SINGLE = "SINGLE",
	MULTIPLE = "MULTIPLE",
	DELTA = "DELTA"
}

export interface CustomView {
	id: string
	name: string
	creationTime: number
	mapSelectionMode: CustomViewMapSelectionMode
	assignedMaps: string[]
	mapChecksum: string
	customViewVersion: string

	stateSettings: {
		appSettings: AppSettings
		dynamicSettings: DynamicSettings
		fileSettings: FileSettings
		treeMap: TreeMapSettings
	}
}

export type ExportCustomView = CustomView

export interface CustomViewsDownloadFile {
	downloadApiVersion: string
	timestamp: number
	customViews: Map<string, ExportCustomView>
}
