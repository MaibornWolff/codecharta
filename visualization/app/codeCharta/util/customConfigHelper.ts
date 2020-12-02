"use strict"
import { LocalStorageCustomConfigs, stateObjectReplacer, stateObjectReviver } from "../codeCharta.model"
import { CustomConfigItemGroup } from "../ui/customConfigs/customConfigs.component"
import {
	CustomConfig,
	CustomConfigMapSelectionMode,
	CustomConfigsDownloadFile, ExportCustomConfig
} from "../model/customConfig/customConfig.api.model"
import { CustomConfigFileStateConnector } from "../ui/customConfigs/customConfigFileStateConnector"
import {FileNameHelper} from "./fileNameHelper";
import {FileDownloader} from "./fileDownloader";

export const CUSTOM_CONFIG_FILE_EXTENSION = ".cc.config.json"
const CUSTOM_CONFIGS_LOCAL_STORAGE_VERSION = "1.0.0"
const CUSTOM_CONFIGS_DOWNLOAD_FILE_VERSION = "1.0.0"
export const CUSTOM_CONFIGS_LOCAL_STORAGE_ELEMENT = "CodeCharta::customConfigs"

export class CustomConfigHelper {
	private static customConfigs: Map<string, CustomConfig> = CustomConfigHelper.loadCustomConfigs()

	static getCustomConfigItemGroups(customConfigFileStateConnector: CustomConfigFileStateConnector): Map<string, CustomConfigItemGroup> {
		const customConfigItemGroups: Map<string, CustomConfigItemGroup> = new Map()

		this.customConfigs.forEach(customConfig => {
			const groupKey = `${customConfig.assignedMaps.join("_")}_${customConfig.mapSelectionMode}`

			if (!customConfigItemGroups.has(groupKey)) {
				customConfigItemGroups.set(groupKey, {
					mapNames: customConfig.assignedMaps.join(" "),
					mapSelectionMode: customConfig.mapSelectionMode,
					hasApplicableItems: false,
					customConfigItems: []
				})
			}

			const customConfigItemApplicable = this.isCustomConfigApplicable(customConfigFileStateConnector, customConfig)
			customConfigItemGroups.get(groupKey).customConfigItems.push({
				id: customConfig.id,
				name: customConfig.name,
				mapNames: customConfig.assignedMaps.join(" "),
				mapSelectionMode: customConfig.mapSelectionMode,
				isApplicable: customConfigItemApplicable
			})

			if (customConfigItemApplicable) {
				customConfigItemGroups.get(groupKey).hasApplicableItems = true
			}
		})

		return customConfigItemGroups
	}

	private static isCustomConfigApplicable(
		customConfigFileStateConnector: CustomConfigFileStateConnector,
		customConfig: CustomConfig
	) {
		// Configs are applicable if their mapChecksums (and mode) are matching, therefore, map names must not be checked.
		return (
			customConfigFileStateConnector.getChecksumOfAssignedMaps() === customConfig.mapChecksum &&
			customConfigFileStateConnector.getMapSelectionMode() === customConfig.mapSelectionMode
		)
	}

	private static setCustomConfigsToLocalStorage() {
		// TODO: #684 adapt storing Configs and Scenarios for standalone version
		const newLocalStorageElement: LocalStorageCustomConfigs = {
			version: CUSTOM_CONFIGS_LOCAL_STORAGE_VERSION,
			customConfigs: [...this.customConfigs]
		}
		localStorage.setItem(CUSTOM_CONFIGS_LOCAL_STORAGE_ELEMENT, JSON.stringify(newLocalStorageElement, stateObjectReplacer))
	}

	private static loadCustomConfigs() {
		const ccLocalStorage: LocalStorageCustomConfigs = JSON.parse(
			localStorage.getItem(CUSTOM_CONFIGS_LOCAL_STORAGE_ELEMENT),
			stateObjectReviver
		)
		return new Map(ccLocalStorage?.customConfigs)
	}

	static addCustomConfig(newCustomConfig: CustomConfig) {
		this.customConfigs.set(newCustomConfig.id, newCustomConfig)
		this.setCustomConfigsToLocalStorage()
	}

	static getCustomConfigSettings(configId: string): CustomConfig | undefined {
		return this.customConfigs.get(configId)
	}

	static hasCustomConfigByName(mapSelectionMode: CustomConfigMapSelectionMode, selectedMaps: string[], configName: string): boolean {
		for (const customConfig of this.customConfigs.values()) {
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

	static getCustomConfigs(): Map<string, CustomConfig> {
		return this.customConfigs
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
			if (CustomConfigHelper.hasCustomConfigByName(exportedConfig.mapSelectionMode, exportedConfig.assignedMaps, exportedConfig.name)) {
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
			}

			CustomConfigHelper.addCustomConfig(importedCustomConfig)
		}
	}

	static downloadCustomConfigs(customConfigs: Map<string, ExportCustomConfig>, customConfigFileStateConnector: CustomConfigFileStateConnector) {
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
			fileName = `${FileNameHelper.withoutCCJsonExtension(customConfigFileStateConnector.getJointMapName())}_${fileName}`
		}

		FileDownloader.downloadData(JSON.stringify(customConfigsDownloadFile, stateObjectReplacer), fileName)
	}

	static createExportCustomConfigFromConfig(customConfig: CustomConfig): ExportCustomConfig {
		const exportCustomConfig: ExportCustomConfig = {
			id: customConfig.id,
			name: customConfig.name,
			creationTime: customConfig.creationTime,
			assignedMaps: customConfig.assignedMaps,
			customConfigVersion: customConfig.customConfigVersion,
			mapChecksum: customConfig.mapChecksum,
			mapSelectionMode: customConfig.mapSelectionMode,
			stateSettings: customConfig.stateSettings
		}

		return exportCustomConfig
	}

	static getCustomConfigsAmountByMapAndMode(mapNames: string, mapSelectionMode: CustomConfigMapSelectionMode): number {
		let count = 0

		this.customConfigs.forEach(config => {
			if (config.assignedMaps.join(" ") === mapNames && config.mapSelectionMode === mapSelectionMode) {
				count++
			}
		})

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
			this.customConfigs.delete(customConfig.id)
		}

		this.setCustomConfigsToLocalStorage()
	}

	static deleteCustomConfig(configId: string) {
		this.customConfigs.delete(configId)
		this.setCustomConfigsToLocalStorage()
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
}
