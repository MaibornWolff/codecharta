import { ColorRange, DynamicSettings } from "../../../../codeCharta.model"

export const _isDynamicSettingAvailable = (name: string, setting: null | string | number | string[] | ColorRange) => {
    if (name === "edgeMetric") {
        return true
    }
    if (setting === null) {
        return false
    }
    if (typeof setting !== "object") {
        return true
    }
    return Object.values(setting).every(v => v !== null)
}

export const areDynamicSettingsAvailable = (dynamicSettings: Partial<DynamicSettings>) =>
    Object.entries(dynamicSettings).every(([name, value]) => _isDynamicSettingAvailable(name, value))
