import { Vector3 } from "three"
import { AppSettings, DynamicSettings, FileSettings, TreeMapSettings } from "../../codeCharta.model"

export enum CustomConfigMapSelectionMode {
	SINGLE = "SINGLE",
	MULTIPLE = "MULTIPLE",
	DELTA = "DELTA"
}

export interface CustomConfig {
	id: string
	name: string
	creationTime: number
	mapSelectionMode: CustomConfigMapSelectionMode
	assignedMaps: string[]
	mapChecksum: string
	customConfigVersion: string

	stateSettings: {
		appSettings: AppSettings
		dynamicSettings: DynamicSettings
		fileSettings: FileSettings
		treeMap: TreeMapSettings
	}
	camera: Vector3
}

export type ExportCustomConfig = CustomConfig

export interface CustomConfigsDownloadFile {
	downloadApiVersion: string
	timestamp: number
	customConfigs: Map<string, ExportCustomConfig>
}
