import { defaultMapState } from "../../../mapState/mapState.read.facade"

// v3: map-view settings → mapState (was appSettings)
export function migrateCcStateRecordToV3<T>(state: T): T {
    if (!state || typeof state !== "object" || !("appSettings" in state) || !state["appSettings"]) {
        return state
    }
    const appSettings = { ...(state["appSettings"] as Record<string, unknown>) }
    const mapState: Record<string, unknown> = { ...defaultMapState, ...(state["mapState"] as Record<string, unknown>) }
    for (const key of Object.keys(defaultMapState)) {
        if (key in appSettings) {
            mapState[key] = appSettings[key]
            delete appSettings[key]
        }
    }
    return { ...state, appSettings, mapState }
}
