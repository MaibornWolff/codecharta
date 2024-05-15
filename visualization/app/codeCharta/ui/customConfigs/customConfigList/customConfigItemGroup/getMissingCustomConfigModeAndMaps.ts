import { CcState } from "../../../../codeCharta.model"
import { CustomConfigItem } from "../../customConfigs.component"
import { visibleFilesBySelectionModeSelector } from "../../visibleFilesBySelectionMode.selector"

type MissingCustomConfigsProperties = {
    mapSelectionMode: string
    mapNames: string[]
}

export function getMissingCustomConfigModeAndMaps(configItem: CustomConfigItem, state: CcState): MissingCustomConfigsProperties {
    const { mapSelectionMode, assignedMaps } = visibleFilesBySelectionModeSelector(state)
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
