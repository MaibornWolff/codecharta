import { CustomConfigItemGroup } from "../customConfigs.component"
import { CustomConfigHelper } from "../../../util/customConfigHelper"
import { VisibleFilesBySelectionMode } from "../visibleFilesBySelectionMode.selector"

export interface CustomConfigGroups {
	applicableItems: Map<string, CustomConfigItemGroup>
	nonApplicableItems: Map<string, CustomConfigItemGroup>
}

export function getCustomConfigItemGroups({ assignedMaps }: VisibleFilesBySelectionMode): CustomConfigGroups {
	const customConfigGroups: CustomConfigGroups = {
		applicableItems: new Map(),
		nonApplicableItems: new Map()
	}
	const customConfigItemGroups = new Map<string, CustomConfigItemGroup>()

	for (const customConfig of CustomConfigHelper.loadCustomConfigs().values()) {
		const mapNames = [...customConfig.assignedMaps.values()]
		const groupKey = `${mapNames.join("_")}_${customConfig.mapSelectionMode}`
		const isCustomConfigItemApplicable = [...customConfig.assignedMaps.keys()].some(configChecksum => assignedMaps.has(configChecksum))

		if (!customConfigItemGroups.has(groupKey)) {
			customConfigItemGroups.set(groupKey, {
				mapNames: mapNames.join(" "),
				mapSelectionMode: customConfig.mapSelectionMode,
				hasApplicableItems: isCustomConfigItemApplicable,
				customConfigItems: []
			})
		}

		customConfigItemGroups.get(groupKey).customConfigItems.push({
			id: customConfig.id,
			name: customConfig.name,
			assignedMaps: customConfig.assignedMaps,
			mapSelectionMode: customConfig.mapSelectionMode,
			isApplicable: isCustomConfigItemApplicable
		})

		if (customConfigItemGroups.get(groupKey).hasApplicableItems) {
			customConfigGroups.applicableItems.set(groupKey, customConfigItemGroups.get(groupKey))
		} else {
			customConfigGroups.nonApplicableItems.set(groupKey, customConfigItemGroups.get(groupKey))
		}
	}

	return customConfigGroups
}
