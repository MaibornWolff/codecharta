import { defaultMapState } from "../../../mapState/mapState.read.facade"
import { defaultMetricsLensSource } from "../../../metricsLensSource/metricsLensSource.read.facade"
import { defaultSharedView } from "../../../sharedView/sharedView.read.facade"
import { isPersistedRecord, KeyMoves, moveKeysIntoRoot } from "./persistedRecord"

// v3: map-view settings → mapState (was appSettings)
export function migrateCcStateRecordToV3<T>(state: T): T {
    if (!isPersistedRecord(state) || !state["appSettings"]) {
        return state
    }
    return moveKeysIntoRoot(state, { appSettings: Object.keys(defaultMapState) }, "mapState", defaultMapState)
}

// v4: colorMode/colorRange/margin/layoutAlgorithm/isLoadingMap/interaction ids → mapState
const V4_MOVES: KeyMoves = {
    dynamicSettings: ["colorMode", "colorRange", "margin"],
    appSettings: ["layoutAlgorithm", "isLoadingMap"],
    appStatus: ["hoveredNodeId", "selectedBuildingId", "rightClickedNodeData"]
}

export function migrateCcStateRecordToV4<T>(state: T): T {
    return moveKeysIntoRoot(state, V4_MOVES, "mapState", defaultMapState)
}

// v5: metric selection (areaMetric/heightMetric/colorMetric/edgeMetric/distributionMetric) → mapState
const V5_MOVES: KeyMoves = {
    dynamicSettings: ["areaMetric", "heightMetric", "colorMetric", "edgeMetric", "distributionMetric"]
}

export function migrateCcStateRecordToV5<T>(state: T): T {
    return moveKeysIntoRoot(state, V5_MOVES, "mapState", defaultMapState)
}

// v6: focusedNodePath + searchPattern → sharedView (new root; was dynamicSettings)
const V6_MOVES: KeyMoves = {
    dynamicSettings: ["focusedNodePath", "searchPattern"]
}

export function migrateCcStateRecordToV6<T>(state: T): T {
    return moveKeysIntoRoot(state, V6_MOVES, "sharedView", defaultSharedView)
}

// v7: attributeTypes + attributeDescriptors → metricsLensSource (new root; was fileSettings)
const V7_MOVES: KeyMoves = {
    fileSettings: ["attributeTypes", "attributeDescriptors"]
}

export function migrateCcStateRecordToV7<T>(state: T): T {
    return moveKeysIntoRoot(state, V7_MOVES, "metricsLensSource", defaultMetricsLensSource)
}

// v8: blacklist → sharedView (was fileSettings)
const V8_MOVES: KeyMoves = {
    fileSettings: ["blacklist"]
}

export function migrateCcStateRecordToV8<T>(state: T): T {
    return moveKeysIntoRoot(state, V8_MOVES, "sharedView", defaultSharedView)
}

// v9: markedPackages → sharedView (was fileSettings)
const V9_MOVES: KeyMoves = {
    fileSettings: ["markedPackages"]
}

export function migrateCcStateRecordToV9<T>(state: T): T {
    return moveKeysIntoRoot(state, V9_MOVES, "sharedView", defaultSharedView)
}
