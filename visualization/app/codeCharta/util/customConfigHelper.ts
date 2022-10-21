"use strict"
import { LocalStorageCustomConfigs, stateObjectReplacer, stateObjectReviver } from "../codeCharta.model"
import { CustomConfigItemGroup } from "../ui/customConfigs/customConfigs.component"
import {
	CustomConfig,
	CustomConfigMapSelectionMode,
	CustomConfigsDownloadFile,
	ExportCustomConfig
} from "../model/customConfig/customConfig.api.model"
import { FileNameHelper } from "./fileNameHelper"
import { FileDownloader } from "./fileDownloader"
import { setState } from "../state/store/state.actions"
import { ThreeCameraService } from "../ui/codeMap/threeViewer/threeCamera.service"
import { ThreeOrbitControlsService } from "../ui/codeMap/threeViewer/threeOrbitControls.service"
import { BehaviorSubject } from "rxjs"
import { Store } from "../state/angular-redux/store"
import { FileState } from "../model/files/files"
import { getMapSelectionMode } from "./customConfigBuilder"

export const CUSTOM_CONFIG_FILE_EXTENSION = ".cc.config.json"
const CUSTOM_CONFIGS_LOCAL_STORAGE_VERSION = "1.0.1"
const CUSTOM_CONFIGS_DOWNLOAD_FILE_VERSION = "1.0.1"
export const CUSTOM_CONFIGS_LOCAL_STORAGE_ELEMENT = "CodeCharta::customConfigs"

export class CustomConfigHelper {
	private static customConfigs: Map<string, CustomConfig> = CustomConfigHelper.loadCustomConfigs()
	static customConfigChange$: BehaviorSubject<null> = new BehaviorSubject(null)

	static setCustomConfigsToLocalStorage() {
		const newLocalStorageElement: LocalStorageCustomConfigs = {
			version: CUSTOM_CONFIGS_LOCAL_STORAGE_VERSION,
			customConfigs: [...CustomConfigHelper.customConfigs]
		}

		localStorage.setItem(CUSTOM_CONFIGS_LOCAL_STORAGE_ELEMENT, JSON.stringify(newLocalStorageElement, stateObjectReplacer))
		CustomConfigHelper.customConfigChange$.next(null)
	}

	static loadCustomConfigs() {
		const ccLocalStorage = this.getCcLocalStorage()
		const configs = new Map(ccLocalStorage?.customConfigs)
		this.mapOldConfigStructureToNew(configs)
		return configs
	}

	private static mapOldConfigStructureToNew(configs: Map<string, CustomConfig>) {
		for (const config of configs.values()) {
			if (config["assignedMaps"]) {
				const checksums = config["mapChecksum"].split(";")
				config.mapNameByChecksum = new Map(checksums.map((checksum, index) => [checksum, config["assignedMaps"][index]]))
			}
		}
	}

	private static getCcLocalStorage() {
		const ccLocalStorage: LocalStorageCustomConfigs = JSON.parse(
			localStorage.getItem(CUSTOM_CONFIGS_LOCAL_STORAGE_ELEMENT),
			stateObjectReviver
		)

		return ccLocalStorage
	}

	static addCustomConfigs(newCustomConfigs: CustomConfig[]) {
		for (const newCustomConfig of newCustomConfigs) {
			CustomConfigHelper.customConfigs.set(newCustomConfig.id, newCustomConfig)
		}
		CustomConfigHelper.setCustomConfigsToLocalStorage()
	}

	static addCustomConfig(newCustomConfig: CustomConfig) {
		CustomConfigHelper.customConfigs.set(newCustomConfig.id, newCustomConfig)
		CustomConfigHelper.setCustomConfigsToLocalStorage()
	}

	static getCustomConfigSettings(configId: string): CustomConfig | undefined {
		return CustomConfigHelper.customConfigs.get(configId)
	}

	static hasCustomConfigByName(
		mapSelectionMode: CustomConfigMapSelectionMode,
		mapNamesByChecksum: Map<string, string>,
		configName: string
	): boolean {
		for (const customConfig of CustomConfigHelper.customConfigs.values()) {
			if (
				customConfig.name === configName &&
				customConfig.mapSelectionMode === mapSelectionMode &&
				this.areEqual(mapNamesByChecksum, customConfig.mapNameByChecksum)
			) {
				return true
			}
		}

		return false
	}

	static areEqual(map1, map2) {
		// early outs
		if (!(map1 instanceof Map) || !(map2 instanceof Map) || map1.size !== map2.size) {
			return false
		}
		// we know we have to maps with the same amount of keys and values. Now compare them
		return [...map1.entries()].every(([key, value]) => map2.has(key) && map2.get(key) === value)
	}

	/*static getCustomConfigByName(
		mapSelectionMode: CustomConfigMapSelectionMode,
		selectedMaps: string[],
		configName: string
	): CustomConfig | null {
		for (const customConfig of CustomConfigHelper.customConfigs.values()) {
			if (
				customConfig.name === configName &&
				customConfig.mapSelectionMode === mapSelectionMode &&
				customConfig.assignedMaps.join("") === selectedMaps.join("")
			) {
				return customConfig
			}
		}

		return null
	}*/

	static getCustomConfigs(): Map<string, CustomConfig> {
		return CustomConfigHelper.customConfigs
	}

	static importCustomConfigs(content: string) {
		const importedCustomConfigsFile: CustomConfigsDownloadFile = JSON.parse(content, stateObjectReviver)

		this.mapOldConfigStructureToNew(importedCustomConfigsFile.customConfigs)

		for (const exportedConfig of importedCustomConfigsFile.customConfigs.values()) {
			const alreadyExistingConfig = CustomConfigHelper.getCustomConfigSettings(exportedConfig.id)

			// Check for a duplicate Config by matching checksums
			if (alreadyExistingConfig) {
				continue
			}

			// Prevent different Configs with the same name
			if (
				CustomConfigHelper.hasCustomConfigByName(
					exportedConfig.mapSelectionMode,
					exportedConfig.mapNameByChecksum,
					exportedConfig.name
				)
			) {
				exportedConfig.name += ` (${FileNameHelper.getFormattedTimestamp(new Date(exportedConfig.creationTime))})`
			}

			const importedCustomConfig: CustomConfig = {
				id: exportedConfig.id,
				name: exportedConfig.name,
				creationTime: exportedConfig.creationTime,
				mapNameByChecksum: exportedConfig.mapNameByChecksum,
				customConfigVersion: exportedConfig.customConfigVersion,
				mapSelectionMode: exportedConfig.mapSelectionMode,
				stateSettings: exportedConfig.stateSettings,
				camera: exportedConfig.camera
			}

			CustomConfigHelper.addCustomConfig(importedCustomConfig)
		}
	}

	static downloadCustomConfigs(customConfigs: Map<string, ExportCustomConfig>) {
		const customConfigsDownloadFile: CustomConfigsDownloadFile = {
			downloadApiVersion: CUSTOM_CONFIGS_DOWNLOAD_FILE_VERSION,
			timestamp: Date.now(),
			customConfigs
		}

		const fileName = FileNameHelper.getNewTimestamp() + CUSTOM_CONFIG_FILE_EXTENSION

		FileDownloader.downloadData(JSON.stringify(customConfigsDownloadFile, stateObjectReplacer), fileName)
	}

	static createExportCustomConfigFromConfig(customConfig: CustomConfig): ExportCustomConfig {
		return { ...customConfig }
	}

	static getCustomConfigsAmountByMapAndMode(mapNames: string, mapSelectionMode: CustomConfigMapSelectionMode): number {
		let count = 0

		for (const config of CustomConfigHelper.customConfigs.values()) {
			if ([...config.mapNameByChecksum.values()].join(" ") === mapNames && config.mapSelectionMode === mapSelectionMode) {
				count++
			}
		}

		return count
	}

	static getConfigNameSuggestionByFileState(fileStates: FileState[]): string {
		const suggestedConfigName = fileStates.map(fileState => fileState.file.fileMeta.fileName).join(" ")

		if (!suggestedConfigName) {
			return ""
		}

		const customConfigNumberSuffix =
			CustomConfigHelper.getCustomConfigsAmountByMapAndMode(suggestedConfigName, getMapSelectionMode(fileStates)) + 1

		return `${suggestedConfigName} #${customConfigNumberSuffix}`
	}

	static deleteCustomConfigs(customConfigs: CustomConfig[]) {
		for (const customConfig of customConfigs) {
			CustomConfigHelper.customConfigs.delete(customConfig.id)
		}

		CustomConfigHelper.setCustomConfigsToLocalStorage()
	}

	static deleteCustomConfig(configId: string) {
		CustomConfigHelper.customConfigs.delete(configId)
		CustomConfigHelper.setCustomConfigsToLocalStorage()
	}

	static sortCustomConfigDropDownGroupList(a: CustomConfigItemGroup, b: CustomConfigItemGroup) {
		if (!b.hasApplicableItems) {
			if (a.hasApplicableItems || a.mapSelectionMode < b.mapSelectionMode) {
				return -1
			}
			if (a.mapSelectionMode === b.mapSelectionMode) {
				return 0
			}
		}

		return 1
	}

	static applyCustomConfig(
		configId: string,
		store: Store,
		threeCameraService: ThreeCameraService,
		threeOrbitControlsService: ThreeOrbitControlsService
	) {
		const customConfig = this.getCustomConfigSettings(configId)
		CustomConfigHelper.transformLegacyCameraSettingsOfCustomConfig(customConfig)
		CustomConfigHelper.deleteUnusedKeyProperties(customConfig)

		store.dispatch(setState(customConfig.stateSettings))
		// TODO: remove this dirty timeout and set camera settings properly
		// This timeout is a chance that CustomConfigs for a small map can be restored and applied completely (even the camera positions)
		if (customConfig.camera) {
			setTimeout(() => {
				threeOrbitControlsService.setControlTarget(customConfig.camera.cameraTarget)
				threeCameraService.setPosition(customConfig.camera.camera)
			}, 100)
		}
	}

	// TODO [2023-01-01] remove support
	private static transformLegacyCameraSettingsOfCustomConfig(customConfig: any) {
		const appSettings = customConfig.stateSettings.appSettings
		if (appSettings.camera || appSettings.cameraTarget) {
			customConfig.camera = {
				camera: appSettings.camera,
				cameraTarget: appSettings.cameraTarget
			}
			delete customConfig.stateSettings.appSettings.camera
			delete customConfig.stateSettings.appSettings.cameraTarget
		}
	}

	// TODO [2023-04-01] remove support
	private static deleteUnusedKeyProperties(customConfig: any) {
		if (customConfig.stateSettings.treeMap || customConfig.stateSettings.fileSettings.attributeTypes) {
			delete customConfig.stateSettings.treeMap
			delete customConfig.stateSettings.fileSettings.attributeTypes
		}
	}
}
