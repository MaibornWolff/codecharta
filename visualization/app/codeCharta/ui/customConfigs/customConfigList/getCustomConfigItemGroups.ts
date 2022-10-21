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
		const mapCheckSums = [...customConfig.mapNameByChecksum.keys()]
		const groupKey = `${mapNames.join("_")}_${customConfig.mapSelectionMode}`

		const isCustomConfigItemApplicable = mapCheckSums.some(
			checksum =>
				fileMapCheckSumsByMapSelectionMode.get(CustomConfigMapSelectionMode.MULTIPLE)?.includes(checksum) ||
				fileMapCheckSumsByMapSelectionMode.get(CustomConfigMapSelectionMode.DELTA)?.includes(checksum)
		)

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
			assignedMaps: customConfig.mapNameByChecksum,
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
