import { appSettingsActions } from "../../store/appSettings/appSettings.actions"
import { dynamicSettingsActions } from "../../store/dynamicSettings/dynamicSettings.actions"
import { fileSettingsActions } from "../../store/fileSettings/fileSettings.actions"
import { fileActions } from "../../../features/fileSelector/stores/files.actions"

export const actionsRequiringSaveCcState = [
    [...fileSettingsActions],
    [...appSettingsActions],
    [...dynamicSettingsActions],
    [...fileActions]
].flat()
