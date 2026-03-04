import { appSettingsActions } from "../../store/appSettings/appSettings.actions"
import { dynamicSettingsActions } from "../../store/dynamicSettings/dynamicSettings.actions"
import { fileSettingsActions } from "../../store/fileSettings/fileSettings.actions"
import { fileActions } from "../../store/files/files.actions"
import { setState } from "../../store/state.actions"

export const actionsRequiringSaveCcState = [
    [...fileSettingsActions],
    [...appSettingsActions],
    [...dynamicSettingsActions],
    [...fileActions],
    setState
].flat()
