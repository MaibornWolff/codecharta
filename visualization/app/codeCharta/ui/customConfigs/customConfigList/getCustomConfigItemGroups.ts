import { CustomConfigItemGroup } from "../customConfigs.component"
import { CustomConfigHelper } from "../../../util/customConfigHelper"
import { CustomConfigMapSelectionMode } from "../../../model/customConfig/customConfig.api.model"

export interface CustomConfigGroups {
	applicableItems: Map<string, CustomConfigItemGroup>
	nonApplicableItems: Map<string, CustomConfigItemGroup>
}

export function getCustomConfigItemGroups(
	fileMapCheckSumsByMapSelectionMode: Map<CustomConfigMapSelectionMode, string[]>
): CustomConfigGroups {
	const customConfigGroups: CustomConfigGroups = {
		applicableItems: new Map<string, CustomConfigItemGroup>(),
		nonApplicableItems: new Map<string, CustomConfigItemGroup>()
	}

	const customConfigItemGroups: Map<string, CustomConfigItemGroup> = new Map()
	for (const customConfig of CustomConfigHelper.loadCustomConfigs().values()) {
		const mapNames = [...customConfig.mapNameByChecksum.values()]
		const groupKey = `${mapNames.join("_")}_${customConfig.mapSelectionMode}`

		if (!customConfigItemGroups.has(groupKey)) {
			customConfigItemGroups.set(groupKey, {
				mapNames: mapNames.join(" "),
				mapSelectionMode: customConfig.mapSelectionMode,
				hasApplicableItems: false,
				customConfigItems: []
			})
		}

		const customConfigItemApplicable = fileMapCheckSumsByMapSelectionMode
			.get(customConfig.mapSelectionMode)
			?.some(checksum => [...customConfig.mapNameByChecksum.keys()].includes(checksum))

		customConfigItemGroups.get(groupKey).customConfigItems.push({
			id: customConfig.id,
			name: customConfig.name,
			mapNames: mapNames.join(" "),
			mapSelectionMode: customConfig.mapSelectionMode,
			isApplicable: customConfigItemApplicable
		})

		if (customConfigItemApplicable) {
			customConfigItemGroups.get(groupKey).hasApplicableItems = true
		}

		if (customConfigItemGroups.get(groupKey).hasApplicableItems) {
			customConfigGroups.applicableItems.set(groupKey, customConfigItemGroups.get(groupKey))
		} else {
			customConfigGroups.nonApplicableItems.set(groupKey, customConfigItemGroups.get(groupKey))
		}
	}

	return customConfigGroups
}
