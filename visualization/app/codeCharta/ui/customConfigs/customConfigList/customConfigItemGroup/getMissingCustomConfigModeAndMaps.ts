import { CustomConfigItem } from "../../customConfigs.component"
import { State } from "../../../../state/angular-redux/state"
import { visibleFilesBySelectionModeSelector } from "../visibleFilesBySelectionMode.selector"

type MissingCustomConfigsProperties = {
	mapSelectionMode: string
	mapNames: string[]
}

export function getMissingCustomConfigModeAndMaps(configItem: CustomConfigItem, state: State): MissingCustomConfigsProperties {
	const { mapSelectionMode, assignedMaps } = visibleFilesBySelectionModeSelector(state.getValue())
	const mapNames = []

	for (const checksum of configItem.assignedMaps.keys()) {
		if (!assignedMaps.has(checksum)) {
			mapNames.push(configItem.assignedMaps.get(checksum))
		}
	}

	return {
		mapSelectionMode: configItem.mapSelectionMode !== mapSelectionMode ? configItem.mapSelectionMode : "",
		mapNames
	}
}
