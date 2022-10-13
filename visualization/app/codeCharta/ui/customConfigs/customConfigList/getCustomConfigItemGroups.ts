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
		const mapNameByChecksum = new Map<string, string>()
		const groupKey = `${customConfig.assignedMaps.join("_")}_${customConfig.mapSelectionMode}`
		const mapCheckSums = customConfig.mapChecksum.split(";")
		const assignedMaps = customConfig.assignedMaps

		if (!customConfigItemGroups.has(groupKey)) {
			customConfigItemGroups.set(groupKey, {
				mapNames: customConfig.assignedMaps.join(" "),
				mapSelectionMode: customConfig.mapSelectionMode,
				hasApplicableItems: false,
				customConfigItems: []
			})
		}

		const isCustomConfigItemApplicable = mapCheckSums.some(
			checksum =>
				fileMapCheckSumsByMapSelectionMode.get(CustomConfigMapSelectionMode.MULTIPLE)?.includes(checksum) ||
				fileMapCheckSumsByMapSelectionMode.get(CustomConfigMapSelectionMode.DELTA)?.includes(checksum)
		)

		mapCheckSums.map((checksum, index) => mapNameByChecksum.set(checksum, assignedMaps[index]))

		customConfigItemGroups.get(groupKey).customConfigItems.push({
			id: customConfig.id,
			name: customConfig.name,
			assignedMaps: mapNameByChecksum,
			mapSelectionMode: customConfig.mapSelectionMode,
			isApplicable: isCustomConfigItemApplicable
		})

		if (isCustomConfigItemApplicable) {
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
