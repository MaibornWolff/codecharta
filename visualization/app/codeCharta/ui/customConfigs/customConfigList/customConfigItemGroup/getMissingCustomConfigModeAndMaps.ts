import { State as StateService } from "@ngrx/store"
import { CcState } from "../../../../codeCharta.model"
import { CustomConfigItem } from "../../customConfigs.component"
import { visibleFilesBySelectionModeSelector } from "../../visibleFilesBySelectionMode.selector"

type MissingCustomConfigsProperties = {
	mapSelectionMode: string
	mapNames: string[]
}

export function getMissingCustomConfigModeAndMaps(
	configItem: CustomConfigItem,
	state: StateService<CcState>
): MissingCustomConfigsProperties {
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
