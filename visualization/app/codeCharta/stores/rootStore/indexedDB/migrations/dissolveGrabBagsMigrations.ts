import { defaultPreferences, defaultSorting } from "../../../preferences/preferences.read.facade"
import { defaultSharedView } from "../../../sharedView/sharedView.read.facade"
import { isPersistedRecord, KeyMoves, moveKeysIntoRoot, PersistedRecord, withoutKeys } from "./persistedRecord"

// v10: isLoadingFile → top-level (was appSettings); currentFilesAreSampleFiles → top-level; drop appStatus
export function migrateCcStateRecordToV10<T>(state: T): T {
    if (!isPersistedRecord(state)) {
        return state
    }
    const next: PersistedRecord = { ...state }
    const { appSettings, appStatus } = state
    if (isPersistedRecord(appSettings)) {
        if ("isLoadingFile" in appSettings) {
            next["isLoadingFile"] = appSettings["isLoadingFile"]
        }
        next["appSettings"] = withoutKeys(appSettings, ["isLoadingFile"])
    }
    if (isPersistedRecord(appStatus) && "currentFilesAreSampleFiles" in appStatus) {
        next["currentFilesAreSampleFiles"] = appStatus["currentFilesAreSampleFiles"]
    }
    return withoutKeys(next, ["appStatus"]) as T
}

// v11: user prefs → preferences (new root; was appSettings + dynamicSettings.sortingOption); drop both grab-bags
const V11_MOVES: KeyMoves = {
    appSettings: [
        "isPresentationMode",
        "resetCameraIfNewFileIsLoaded",
        "sortingOrderAscending",
        "maxTreeMapFiles",
        "experimentalFeaturesEnabled",
        "screenshotToClipboardEnabled",
        "isColorMetricLinkedToHeightMetric"
    ],
    dynamicSettings: ["sortingOption"]
}

export function migrateCcStateRecordToV11<T>(state: T): T {
    const withPreferences = moveKeysIntoRoot(state, V11_MOVES, "preferences", defaultPreferences)
    return withoutKeys(withPreferences, Object.keys(V11_MOVES))
}

// v12: sortingOption + sortingOrderAscending → preferences.sorting = { option, orderAscending }
export function migrateCcStateRecordToV12<T>(state: T): T {
    if (!isPersistedRecord(state) || !isPersistedRecord(state["preferences"])) {
        return state
    }
    const preferences = state["preferences"]
    const option = "sortingOption" in preferences ? preferences["sortingOption"] : defaultSorting.option
    const orderAscending = "sortingOrderAscending" in preferences ? preferences["sortingOrderAscending"] : defaultSorting.orderAscending
    const trimmed = withoutKeys(preferences, ["sortingOption", "sortingOrderAscending"])
    return { ...state, preferences: { ...trimmed, sorting: { option, orderAscending } } } as T
}

// v14: hoveredNodeId/selectedBuildingId/rightClickedNodeData → sharedView (was mapState; seed as null)
const V14_INTERACTION_KEYS = ["hoveredNodeId", "selectedBuildingId", "rightClickedNodeData"]

export function migrateCcStateRecordToV14<T>(state: T): T {
    if (!isPersistedRecord(state)) {
        return state
    }
    const next: PersistedRecord = { ...state }
    if (isPersistedRecord(state["mapState"])) {
        next["mapState"] = withoutKeys(state["mapState"], V14_INTERACTION_KEYS)
    }
    const nulledInteractions = Object.fromEntries(V14_INTERACTION_KEYS.map(key => [key, null]))
    next["sharedView"] = { ...defaultSharedView, ...(state["sharedView"] as PersistedRecord), ...nulledInteractions }
    return next as T
}

// v15: drop fileSettings (edges now derives from the dependency lens, not stored)
export function migrateCcStateRecordToV15<T>(state: T): T {
    return withoutKeys(state, ["fileSettings"])
}
