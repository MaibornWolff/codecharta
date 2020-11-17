"use strict"
import { LocalStorageCustomConfigs, stateObjectReplacer, stateObjectReviver } from "../codeCharta.model"
import { CustomConfigItemGroup } from "../ui/customConfigs/customConfigs.component"
import {
	CustomConfig,
	CustomConfigMapSelectionMode,
	CustomConfigsDownloadFile
} from "../model/customConfig/customConfig.api.model"
import { CustomConfigFileStateConnector } from "../ui/customConfigs/customConfigFileStateConnector"
import { createCustomConfigIdentifier } from "./customConfigBuilder"

export class CustomConfigHelper {
	private static readonly CUSTOM_CONFIGS_LOCAL_STORAGE_VERSION = "1.0.0"
	private static readonly CUSTOM_CONFIGS_LOCAL_STORAGE_ELEMENT = "CodeCharta::customConfigs"

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
		// Configs are applicable if their checksums (and mode) are matching, therefore, map names must not be checked.
		return (
			customConfigFileStateConnector.getChecksumOfAssignedMaps() === customConfig.mapChecksum &&
			customConfigFileStateConnector.getMapSelectionMode() === customConfig.mapSelectionMode
		)
	}

	private static setCustomConfigsToLocalStorage() {
		const newLocalStorageElement: LocalStorageCustomConfigs = {
			version: this.CUSTOM_CONFIGS_LOCAL_STORAGE_VERSION,
			customConfigs: [...this.customConfigs]
		}
		localStorage.setItem(this.CUSTOM_CONFIGS_LOCAL_STORAGE_ELEMENT, JSON.stringify(newLocalStorageElement, stateObjectReplacer))
	}

	private static loadCustomConfigs() {
		const ccLocalStorage: LocalStorageCustomConfigs = JSON.parse(
			localStorage.getItem(this.CUSTOM_CONFIGS_LOCAL_STORAGE_ELEMENT),
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

	static hasCustomConfig(mapSelectionMode: CustomConfigMapSelectionMode, selectedMaps: string[], configName: string): boolean {
		const customConfigIdentifier = createCustomConfigIdentifier(mapSelectionMode, selectedMaps, configName)

		return this.customConfigs.has(customConfigIdentifier)
	}

	static getCustomConfigs(): Map<string, CustomConfig> {
		return this.customConfigs
	}

	static importCustomConfigs(content: string) {
		const importedCustomConfigsFile: CustomConfigsDownloadFile = JSON.parse(content, stateObjectReviver)

		// TODO: we might add an input validation
		// TODO: we must handle duplicates

		for (const value of importedCustomConfigsFile.customConfigs.values()) {
			const importedCustomConfig: CustomConfig = {
				assignedMaps: value.assignedMaps,
				customConfigVersion: value.customConfigVersion,
				id: value.id,
				mapChecksum: value.mapChecksum,
				mapSelectionMode: value.mapSelectionMode,
				name: value.name,
				stateSettings: value.stateSettings,
				creationTime: Date.now()
			}

			CustomConfigHelper.addCustomConfig(importedCustomConfig)
		}
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
