import { RecursivePartial, Settings, CcState } from "../../../codeCharta.model"
import { convertToVectors } from "../../../util/settingsHelper"
import { codeMapNodesSelector } from "../../../state/selectors/accumulatedData/codeMapNodes.selector"
import { getNumberOfTopLabels } from "../../../state/effects/updateVisibleTopLabels/getNumberOfTopLabels"
import { defaultState } from "../state.manager"

const MAP_STATE_AMOUNT_OF_TOP_LABELS = "mapState.amountOfTopLabels"

export const getPartialDefaultState = (settingKeys: string[], state: CcState) => {
    const updatedSettings: RecursivePartial<Settings> = {}
    let settingsCounter = 0

    for (const token of settingKeys) {
        const steps = token.split(".")
        let defaultSettingsPointer = defaultState
        let updatedSettingsPointer = updatedSettings

        for (const [index, step] of steps.entries()) {
            if (defaultSettingsPointer[step] !== undefined) {
                if (!updatedSettingsPointer[step]) {
                    updatedSettingsPointer[step] = {}
                    settingsCounter++
                }
                if (index === steps.length - 1) {
                    updatedSettingsPointer[step] = defaultSettingsPointer[step]
                } else {
                    defaultSettingsPointer = defaultSettingsPointer[step]
                    updatedSettingsPointer = updatedSettingsPointer[step]
                }
            }
        }
    }

    if (settingsCounter !== 0) {
        convertToVectors(updatedSettings)
    }

    if (settingKeys.includes(MAP_STATE_AMOUNT_OF_TOP_LABELS)) {
        updatedSettings.mapState.amountOfTopLabels = getNumberOfTopLabels(codeMapNodesSelector(state))
    }

    return updatedSettings
}
