import { Vector3 } from "three"
import { AppSettings, DynamicSettings, FileSettings } from "../../codeCharta.model"

export enum CustomConfigMapSelectionMode {
	MULTIPLE = "MULTIPLE",
	DELTA = "DELTA"
}

export interface CustomConfig {
	id: string
	name: string
	creationTime: number
	mapSelectionMode: CustomConfigMapSelectionMode
	mapNameByChecksum: Map<string, string>
	customConfigVersion: string

	stateSettings: {
		appSettings: AppSettings
		dynamicSettings: DynamicSettings
		fileSettings: Omit<FileSettings, "attributeTypes">
	}
	camera: {
		camera: Vector3
		cameraTarget: Vector3
	}
}

export type ExportCustomConfig = CustomConfig

export interface CustomConfigsDownloadFile {
	downloadApiVersion: string
	timestamp: number
	customConfigs: Map<string, ExportCustomConfig>
}
