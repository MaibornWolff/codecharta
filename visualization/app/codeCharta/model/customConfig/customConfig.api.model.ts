import { AppSettings, DynamicSettings, FileSettings, TreeMapSettings } from "../../codeCharta.model"

export enum CustomConfigMapSelectionMode {
	SINGLE = "SINGLE",
	MULTIPLE = "MULTIPLE",
	DELTA = "DELTA"
}

export interface CustomConfig {
	id: string
	name: string
	mapSelectionMode: CustomConfigMapSelectionMode
	assignedMaps: string[]
	mapChecksum: string
	customConfigVersion: string
	creationTime: number

	stateSettings: {
		appSettings: AppSettings
		dynamicSettings: DynamicSettings
		fileSettings: FileSettings
		treeMap: TreeMapSettings
	}
}

export interface ExportCustomConfig {
	id: string
	name: string
	mapSelectionMode: CustomConfigMapSelectionMode
	assignedMaps: string[]
	mapChecksum: string
	customConfigVersion: string
	creationTime: number

	stateSettings: {
		appSettings: AppSettings
		dynamicSettings: DynamicSettings
		fileSettings: FileSettings
		treeMap: TreeMapSettings
	}
}

export interface CustomConfigsDownloadFile {
	downloadApiVersion: string
	timestamp: number
	customConfigs: Map<string, ExportCustomConfig>
}