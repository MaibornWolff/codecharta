import { CustomConfigItem } from "../../customConfigs.component"
import { State } from "../../../../state/angular-redux/state"
import { fileMapCheckSumsSelector } from "../fileMapCheckSums.selector"

type MissingCustomConfigsProperties = {
	mode: string
	missingMaps: string[]
}

export function getMissingCustomConfigModeAndMaps(configItem: CustomConfigItem, state: State): MissingCustomConfigsProperties {
	const missingMaps = []
	const mapCheckSumBySelectionMode = fileMapCheckSumsSelector(state.getValue())
	const [currentMapChecksums] = mapCheckSumBySelectionMode.values()

	for (const [checksum] of configItem.assignedMaps) {
		if (!currentMapChecksums?.includes(checksum)) {
			missingMaps.push(configItem.assignedMaps.get(checksum))
		}
	}

	const mode = configItem.mapSelectionMode !== mapCheckSumBySelectionMode.keys().next().value ? configItem.mapSelectionMode : ""

	return {
		mode,
		missingMaps
	}
}
