"use strict"
import { LocalStorageCustomConfigs, stateObjectReplacer, stateObjectReviver } from "../codeCharta.model"
import { CustomConfigItemGroup } from "../ui/customConfigs/customConfigs.component"
import {
	CustomConfig,
	CustomConfigMapSelectionMode,
	CustomConfigsDownloadFile,
	ExportCustomConfig
} from "../model/customConfig/customConfig.api.model"
import { CustomConfigFileStateConnector } from "../ui/customConfigs/customConfigFileStateConnector"
import { FileNameHelper } from "./fileNameHelper"
import { FileDownloader } from "./fileDownloader"
import { setState } from "../state/store/state.actions"
import { setColorRange } from "../state/store/dynamicSettings/colorRange/colorRange.actions"
import { setMargin } from "../state/store/dynamicSettings/margin/margin.actions"
import { ThreeCameraService } from "../ui/codeMap/threeViewer/threeCameraService"
import { ThreeOrbitControlsService } from "../ui/codeMap/threeViewer/threeOrbitControlsService"
import { BehaviorSubject } from "rxjs"
import { Store } from "../state/angular-redux/store"

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
		return new Map(ccLocalStorage?.customConfigs)
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

	static hasCustomConfigByName(mapSelectionMode: CustomConfigMapSelectionMode, selectedMaps: string[], configName: string): boolean {
		for (const customConfig of CustomConfigHelper.customConfigs.values()) {
			if (
				customConfig.name === configName &&
				customConfig.mapSelectionMode === mapSelectionMode &&
				customConfig.assignedMaps.join("") === selectedMaps.join("")
			) {
				return true
			}
		}

		return false
	}

	static getCustomConfigByName(
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
	}

	static getCustomConfigs(): Map<string, CustomConfig> {
		return CustomConfigHelper.customConfigs
	}

	static importCustomConfigs(content: string) {
		const importedCustomConfigsFile: CustomConfigsDownloadFile = JSON.parse(content, stateObjectReviver)

		for (const exportedConfig of importedCustomConfigsFile.customConfigs.values()) {
			const alreadyExistingConfig = CustomConfigHelper.getCustomConfigSettings(exportedConfig.id)

			// Check for a duplicate Config by matching checksums
			if (alreadyExistingConfig) {
				continue
			}

			// Prevent different Configs with the same name
			if (
				CustomConfigHelper.hasCustomConfigByName(exportedConfig.mapSelectionMode, exportedConfig.assignedMaps, exportedConfig.name)
			) {
				exportedConfig.name += ` (${FileNameHelper.getFormattedTimestamp(new Date(exportedConfig.creationTime))})`
			}

			const importedCustomConfig: CustomConfig = {
				id: exportedConfig.id,
				name: exportedConfig.name,
				creationTime: exportedConfig.creationTime,
				assignedMaps: exportedConfig.assignedMaps,
				customConfigVersion: exportedConfig.customConfigVersion,
				mapChecksum: exportedConfig.mapChecksum,
				mapSelectionMode: exportedConfig.mapSelectionMode,
				stateSettings: exportedConfig.stateSettings,
				camera: exportedConfig.camera
			}

			CustomConfigHelper.addCustomConfig(importedCustomConfig)
		}
	}

	static downloadCustomConfigs(
		customConfigs: Map<string, ExportCustomConfig>,
		customConfigFileStateConnector: CustomConfigFileStateConnector
	) {
		const customConfigsDownloadFile: CustomConfigsDownloadFile = {
			downloadApiVersion: CUSTOM_CONFIGS_DOWNLOAD_FILE_VERSION,
			timestamp: Date.now(),
			customConfigs
		}

		let fileName = FileNameHelper.getNewTimestamp() + CUSTOM_CONFIG_FILE_EXTENSION

		if (
			!customConfigFileStateConnector.isDeltaMode() &&
			customConfigFileStateConnector.getAmountOfUploadedFiles() === 1 &&
			customConfigFileStateConnector.isEachFileSelected()
		) {
			// If only one map is uploaded/present in SINGLE mode, prefix the .cc.config.json file with its name.
			fileName = `${FileNameHelper.withoutCCExtension(customConfigFileStateConnector.getJointMapName())}_${fileName}`
		}

		FileDownloader.downloadData(JSON.stringify(customConfigsDownloadFile, stateObjectReplacer), fileName)
	}

	static createExportCustomConfigFromConfig(customConfig: CustomConfig): ExportCustomConfig {
		return { ...customConfig }
	}

	static getCustomConfigsAmountByMapAndMode(mapNames: string, mapSelectionMode: CustomConfigMapSelectionMode): number {
		let count = 0

		for (const config of CustomConfigHelper.customConfigs.values()) {
			if (config.assignedMaps.join(" ") === mapNames && config.mapSelectionMode === mapSelectionMode) {
				count++
			}
		}

		return count
	}

	static getConfigNameSuggestionByFileState(customConfigFileStateConnector: CustomConfigFileStateConnector): string {
		const suggestedConfigName = customConfigFileStateConnector.getJointMapName()

		if (!suggestedConfigName) {
			return ""
		}

		const customConfigNumberSuffix =
			CustomConfigHelper.getCustomConfigsAmountByMapAndMode(
				customConfigFileStateConnector.getJointMapName(),
				customConfigFileStateConnector.getMapSelectionMode()
			) + 1

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

		// TODO: Setting state from loaded CustomConfig not working at the moment
		//  due to issues of the event architecture.

		// TODO: Check if state properties differ
		// Create new partial State (updates) for changed values only
		store.dispatch(setState(customConfig.stateSettings))

		// Should we fire another event "ResettingStateFinishedEvent"
		// We could add a listener then to reset the camera

		store.dispatch(setColorRange(customConfig.stateSettings.dynamicSettings.colorRange))
		store.dispatch(setMargin(customConfig.stateSettings.dynamicSettings.margin))

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
}
