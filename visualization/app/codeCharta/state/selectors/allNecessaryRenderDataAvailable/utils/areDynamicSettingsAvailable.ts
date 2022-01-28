import { ColorRange, DynamicSettings } from "../../../../codeCharta.model"

const isDynamicSettingAvailable = (setting: null | string | number | string[] | ColorRange) => {
	if (setting === null) return false
	if (typeof setting !== "object") return true
	return Object.values(setting).every(v => v !== null)
}

export const areDynamicSettingsAvailable = (dynamicSettings: Partial<DynamicSettings>) =>
	Object.values(dynamicSettings).every(value => isDynamicSettingAvailable(value))
