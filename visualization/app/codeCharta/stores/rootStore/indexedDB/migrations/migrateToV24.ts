import { defaultRadialFolderStyle, defaultRadialFolderTint, defaultRadialFolderValue } from "../../../preferences/preferences.read.facade"

// v24: preferences persisted before the radial layouts coloured their folders carry no folder colouring
export function migrateCcStateRecordToV24<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const preferences = record["preferences"]
    if (!preferences || typeof preferences !== "object" || "radialFolderValue" in preferences) {
        return state
    }
    const radialFolderColoring = {
        radialFolderValue: defaultRadialFolderValue,
        radialFolderStyle: defaultRadialFolderStyle,
        radialFolderTint: defaultRadialFolderTint
    }
    return { ...record, preferences: { ...radialFolderColoring, ...preferences } } as T
}
