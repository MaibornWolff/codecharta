"use strict"
import { LocalStorageCustomConfigs, RecursivePartial, stateObjectReplacer, stateObjectReviver } from "../codeCharta.model"
import { CustomConfigItemGroup } from "../ui/customConfigs/customConfigs.component"
import { CustomConfig, CustomConfigMapSelectionMode } from "../model/customConfig/customConfig.api.model"
import { CustomConfigFileStateConnector } from "../ui/customConfigs/customConfigFileStateConnector"
import { createCustomConfigIdentifier } from "./customConfigBuilder"

export class CustomConfigHelper {
	private static readonly CUSTOM_VIEWS_LOCAL_STORAGE_VERSION = "1.0.0"
	private static readonly CUSTOM_VIEWS_LOCAL_STORAGE_ELEMENT = "CodeCharta::customConfigs"

	private static customConfigs: Map<string, RecursivePartial<CustomConfig>> = CustomConfigHelper.loadCustomConfigs()

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
		customConfig: RecursivePartial<CustomConfig>
	) {
		// TODO: Follow Up: Configs are applicable if their checksums are matching, but map names should not be checked.
		return (
			customConfigFileStateConnector.getJointMapName() === customConfig.assignedMaps.join(" ") &&
			customConfigFileStateConnector.getChecksumOfAssignedMaps() === customConfig.mapChecksum &&
			customConfigFileStateConnector.getMapSelectionMode() === customConfig.mapSelectionMode
		)
	}

	private static setCustomConfigsToLocalStorage() {
		const newLocalStorageElement: LocalStorageCustomConfigs = {
			version: this.CUSTOM_VIEWS_LOCAL_STORAGE_VERSION,
			customConfigs: [...this.customConfigs]
		}
		localStorage.setItem(this.CUSTOM_VIEWS_LOCAL_STORAGE_ELEMENT, JSON.stringify(newLocalStorageElement, stateObjectReplacer))
	}

	private static loadCustomConfigs() {
		const ccLocalStorage: LocalStorageCustomConfigs = JSON.parse(
			localStorage.getItem(this.CUSTOM_VIEWS_LOCAL_STORAGE_ELEMENT),
			stateObjectReviver
		)
		return new Map(ccLocalStorage?.customConfigs)
	}

	static addCustomConfig(newCustomConfig: RecursivePartial<CustomConfig>) {
		this.customConfigs.set(newCustomConfig.id, newCustomConfig)
		this.setCustomConfigsToLocalStorage()
	}

	static getCustomConfigSettings(viewId: string): RecursivePartial<CustomConfig> | undefined {
		return this.customConfigs.get(viewId)
	}

	static hasCustomConfig(mapSelectionMode: CustomConfigMapSelectionMode, selectedMaps: string[], viewName: string): boolean {
		const customConfigIdentifier = createCustomConfigIdentifier(mapSelectionMode, selectedMaps, viewName)

		return this.customConfigs.has(customConfigIdentifier)
	}

	static getCustomConfigsAmountByMapAndMode(mapNames: string, mapSelectionMode: CustomConfigMapSelectionMode): number {
		let count = 0

		this.customConfigs.forEach(view => {
			if (view.assignedMaps.join(" ") === mapNames && view.mapSelectionMode === mapSelectionMode) {
				count++
			}
		})

		return count
	}

	static getViewNameSuggestionByFileState(customConfigFileStateConnector: CustomConfigFileStateConnector): string {
		const suggestedViewName = customConfigFileStateConnector.getJointMapName()

		if (!suggestedViewName) {
			return ""
		}

		const customConfigNumberSuffix =
			CustomConfigHelper.getCustomConfigsAmountByMapAndMode(
				customConfigFileStateConnector.getJointMapName(),
				customConfigFileStateConnector.getMapSelectionMode()
			) + 1

		return `${suggestedViewName} #${customConfigNumberSuffix}`
	}

	static deleteCustomConfig(viewId: string) {
		this.customConfigs.delete(viewId)
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
