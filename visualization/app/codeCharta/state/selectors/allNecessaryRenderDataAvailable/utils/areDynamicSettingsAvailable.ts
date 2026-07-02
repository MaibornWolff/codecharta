import { ColorRange, DynamicSettings, PrimaryMetrics } from "../../../../codeCharta.model"

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

// colorRange is included in the availability check even though it now lives on mapState (Slice 6):
// the first-render gate must still wait for the color range to be computed. The caller folds
// mapState.colorRange back in.
export const areDynamicSettingsAvailable = (
    settings: Partial<DynamicSettings> & Partial<PrimaryMetrics> & { distributionMetric?: string; colorRange?: ColorRange | null }
) => Object.entries(settings).every(([name, value]) => _isDynamicSettingAvailable(name, value))
