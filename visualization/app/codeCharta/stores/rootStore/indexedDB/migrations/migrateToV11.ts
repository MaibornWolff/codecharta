import { defaultPreferences } from "../../../preferences/preferences.read.facade"

// v11: user prefs → preferences (new root; was appSettings + dynamicSettings.sortingOption); drop both grab-bags
const V11_PREFERENCE_KEYS_FROM_APPSETTINGS = [
    "isPresentationMode",
    "resetCameraIfNewFileIsLoaded",
    "sortingOrderAscending",
    "maxTreeMapFiles",
    "experimentalFeaturesEnabled",
    "screenshotToClipboardEnabled",
    "isColorMetricLinkedToHeightMetric"
]

export function migrateCcStateRecordToV11<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const preferences: Record<string, unknown> = {
        ...defaultPreferences,
        ...(record["preferences"] as Record<string, unknown>)
    }
    const next: Record<string, unknown> = { ...record }
    const appSettings = record["appSettings"]
    if (appSettings && typeof appSettings === "object") {
        for (const key of V11_PREFERENCE_KEYS_FROM_APPSETTINGS) {
            if (key in (appSettings as Record<string, unknown>)) {
                preferences[key] = (appSettings as Record<string, unknown>)[key]
            }
        }
    }
    const dynamicSettings = record["dynamicSettings"]
    if (dynamicSettings && typeof dynamicSettings === "object" && "sortingOption" in (dynamicSettings as Record<string, unknown>)) {
        preferences["sortingOption"] = (dynamicSettings as Record<string, unknown>)["sortingOption"]
    }
    next["preferences"] = preferences
    delete next["appSettings"]
    delete next["dynamicSettings"]
    return next as T
}
