import { CcState } from "app/codeCharta/codeCharta.model"
import { defaultMapState } from "../../mapState/mapState.facade"
import { defaultSharedView } from "../../sharedView/sharedView.read.facade"
import { defaultMetricsLensSource } from "../../lenses/metrics/metricsLens.load.facade"
import { defaultPreferences, defaultSorting } from "../../preferences/preferences.read.facade"
import { openDB } from "idb"

export const DB_NAME = "CodeCharta"
export const DB_VERSION = 12
export const CCSTATE_STORE_NAME = "ccstate"
export const SCENARIOS_STORE_NAME = "scenarios"
export const CCSTATE_PRIMARY_KEY = "id"
export const CCSTATE_STATE_ID = 1001

// v3 (Slice 5): the map-view settings moved out of appSettings into their own mapState root.
// A persisted CcState blob written at v2 still keeps those values under appSettings; re-home them
// so neither the rehydrate applier nor _applyPartialState's isKeyOf guard silently drops them
// back to defaults (there would be no crash and no snapshot signal — hence a real record transform,
// not a bare version bump).
export function migrateCcStateRecordToV3<T>(state: T): T {
    if (!state || typeof state !== "object" || !("appSettings" in state) || !state["appSettings"]) {
        return state
    }
    const appSettings = { ...(state["appSettings"] as Record<string, unknown>) }
    const mapState: Record<string, unknown> = { ...defaultMapState, ...((state["mapState"] as Record<string, unknown>) ?? {}) }
    for (const key of Object.keys(defaultMapState)) {
        if (key in appSettings) {
            mapState[key] = appSettings[key]
            delete appSettings[key]
        }
    }
    return { ...state, appSettings, mapState }
}

// v4 (Slice 6): the presentation stragglers (colorMode/colorRange/margin from dynamicSettings,
// layoutAlgorithm/isLoadingMap from appSettings) and the transient interaction ids (hoveredNodeId/
// selectedBuildingId/rightClickedNodeData from appStatus) moved into mapState. Re-home them in a
// persisted blob so the rehydrate applier finds them under mapState instead of silently reverting
// them to defaults — same silent-data-loss landmine the v3 transform closes.
const V4_MOVES: Record<string, string[]> = {
    dynamicSettings: ["colorMode", "colorRange", "margin"],
    appSettings: ["layoutAlgorithm", "isLoadingMap"],
    appStatus: ["hoveredNodeId", "selectedBuildingId", "rightClickedNodeData"]
}

export function migrateCcStateRecordToV4<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const mapState: Record<string, unknown> = { ...defaultMapState, ...((record["mapState"] as Record<string, unknown>) ?? {}) }
    const next: Record<string, unknown> = { ...record }
    for (const [home, keys] of Object.entries(V4_MOVES)) {
        const source = record[home]
        if (!source || typeof source !== "object") {
            continue
        }
        const trimmed = { ...(source as Record<string, unknown>) }
        for (const key of keys) {
            if (key in trimmed) {
                mapState[key] = trimmed[key]
                delete trimmed[key]
            }
        }
        next[home] = trimmed
    }
    next["mapState"] = mapState
    return next as T
}

// v5 (Slice 7): the metric SELECTION (areaMetric/heightMetric/colorMetric/edgeMetric/
// distributionMetric) moved out of dynamicSettings into mapState. Re-home them in a persisted
// blob so the rehydrate applier finds them under mapState instead of silently reverting them to
// defaults — same silent-data-loss landmine the v3/v4 transforms close.
const V5_MOVES: Record<string, string[]> = {
    dynamicSettings: ["areaMetric", "heightMetric", "colorMetric", "edgeMetric", "distributionMetric"]
}

export function migrateCcStateRecordToV5<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const mapState: Record<string, unknown> = { ...defaultMapState, ...((record["mapState"] as Record<string, unknown>) ?? {}) }
    const next: Record<string, unknown> = { ...record }
    for (const [home, keys] of Object.entries(V5_MOVES)) {
        const source = record[home]
        if (!source || typeof source !== "object") {
            continue
        }
        const trimmed = { ...(source as Record<string, unknown>) }
        for (const key of keys) {
            if (key in trimmed) {
                mapState[key] = trimmed[key]
                delete trimmed[key]
            }
        }
        next[home] = trimmed
    }
    next["mapState"] = mapState
    return next as T
}

// v6 (Slice 8): focusedNodePath + searchPattern moved out of dynamicSettings into a brand-new
// sharedView root. Unlike v3/v4/v5 — which merged INTO the pre-existing mapState — this is the FIRST
// migration that CREATES a new root: an old (v5-shaped) blob has NO sharedView at all. Build it fresh
// from defaultSharedView + the two moved keys pulled out of dynamicSettings, so the rehydrate applier
// finds them under sharedView instead of silently reverting them to defaults — same silent-data-loss
// landmine the v3/v4/v5 transforms close.
const V6_MOVES: Record<string, string[]> = {
    dynamicSettings: ["focusedNodePath", "searchPattern"]
}

export function migrateCcStateRecordToV6<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const sharedView: Record<string, unknown> = { ...defaultSharedView, ...((record["sharedView"] as Record<string, unknown>) ?? {}) }
    const next: Record<string, unknown> = { ...record }
    for (const [home, keys] of Object.entries(V6_MOVES)) {
        const source = record[home]
        if (!source || typeof source !== "object") {
            continue
        }
        const trimmed = { ...(source as Record<string, unknown>) }
        for (const key of keys) {
            if (key in trimmed) {
                sharedView[key] = trimmed[key]
                delete trimmed[key]
            }
        }
        next[home] = trimmed
    }
    next["sharedView"] = sharedView
    return next as T
}

// v7 (Slice 9a): attributeTypes + attributeDescriptors moved out of fileSettings into a brand-new
// metricsLensSource root (owned by the metrics lens). Like v6, this CREATES a new root: an old
// (v6-shaped) blob has NO metricsLensSource. Build it fresh from defaultMetricsLensSource + the two
// moved keys pulled out of fileSettings, so the rehydrate applier finds them under metricsLensSource
// instead of silently reverting them to defaults — same silent-data-loss landmine the v3–v6 transforms close.
const V7_MOVES: Record<string, string[]> = {
    fileSettings: ["attributeTypes", "attributeDescriptors"]
}

export function migrateCcStateRecordToV7<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const metricsLensSource: Record<string, unknown> = {
        ...defaultMetricsLensSource,
        ...((record["metricsLensSource"] as Record<string, unknown>) ?? {})
    }
    const next: Record<string, unknown> = { ...record }
    for (const [home, keys] of Object.entries(V7_MOVES)) {
        const source = record[home]
        if (!source || typeof source !== "object") {
            continue
        }
        const trimmed = { ...(source as Record<string, unknown>) }
        for (const key of keys) {
            if (key in trimmed) {
                metricsLensSource[key] = trimmed[key]
                delete trimmed[key]
            }
        }
        next[home] = trimmed
    }
    next["metricsLensSource"] = metricsLensSource
    return next as T
}

// v8 (Slice 9b): blacklist moved out of fileSettings into the sharedView root. Unlike v6/v7 — which
// CREATED new roots — the sharedView root already exists (created at v6), so this MERGES into it,
// exactly like v3/v4/v5 merged into the pre-existing mapState. Re-home blacklist so the rehydrate applier
// finds it under sharedView instead of silently reverting it to defaults — same silent-data-loss landmine
// the v3–v7 transforms close.
const V8_MOVES: Record<string, string[]> = {
    fileSettings: ["blacklist"]
}

export function migrateCcStateRecordToV8<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const sharedView: Record<string, unknown> = { ...defaultSharedView, ...((record["sharedView"] as Record<string, unknown>) ?? {}) }
    const next: Record<string, unknown> = { ...record }
    for (const [home, keys] of Object.entries(V8_MOVES)) {
        const source = record[home]
        if (!source || typeof source !== "object") {
            continue
        }
        const trimmed = { ...(source as Record<string, unknown>) }
        for (const key of keys) {
            if (key in trimmed) {
                sharedView[key] = trimmed[key]
                delete trimmed[key]
            }
        }
        next[home] = trimmed
    }
    next["sharedView"] = sharedView
    return next as T
}

// v9 (Slice 9c): markedPackages moved out of fileSettings into the sharedView root. Like v8, the
// sharedView root already exists (created at v6), so this MERGES into it (mirrors v3/v4/v5/v8), not a
// new root. Re-home markedPackages so the rehydrate applier finds it under sharedView instead of
// silently reverting it to defaults — same silent-data-loss landmine the v3–v8 transforms close.
const V9_MOVES: Record<string, string[]> = {
    fileSettings: ["markedPackages"]
}

export function migrateCcStateRecordToV9<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const sharedView: Record<string, unknown> = { ...defaultSharedView, ...((record["sharedView"] as Record<string, unknown>) ?? {}) }
    const next: Record<string, unknown> = { ...record }
    for (const [home, keys] of Object.entries(V9_MOVES)) {
        const source = record[home]
        if (!source || typeof source !== "object") {
            continue
        }
        const trimmed = { ...(source as Record<string, unknown>) }
        for (const key of keys) {
            if (key in trimmed) {
                sharedView[key] = trimmed[key]
                delete trimmed[key]
            }
        }
        next[home] = trimmed
    }
    next["sharedView"] = sharedView
    return next as T
}

// v10 (Slice 10a): the file-provenance flags moved out of the appSettings/appStatus grab-bags into
// their own top-level roots owned by the fileStore — appSettings.isLoadingFile → isLoadingFile,
// appStatus.currentFilesAreSampleFiles → currentFilesAreSampleFiles — and the now-empty appStatus
// grab-bag is dropped. Unlike v3–v9 (which merged into an existing/new nested root), this promotes two
// scalar flags to top-level roots and deletes a whole grab-bag. The rehydrate appliers never restored
// these runtime flags, but keeping the persisted record shape-valid mirrors the v3–v9 transforms and
// defends any full-blob apply against the same silent-data-loss landmine.
export function migrateCcStateRecordToV10<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const next: Record<string, unknown> = { ...record }

    const appSettings = record["appSettings"]
    if (appSettings && typeof appSettings === "object") {
        const trimmed = { ...(appSettings as Record<string, unknown>) }
        if ("isLoadingFile" in trimmed) {
            next["isLoadingFile"] = trimmed["isLoadingFile"]
            delete trimmed["isLoadingFile"]
        }
        next["appSettings"] = trimmed
    }

    const appStatus = record["appStatus"]
    if (appStatus && typeof appStatus === "object" && "currentFilesAreSampleFiles" in (appStatus as Record<string, unknown>)) {
        next["currentFilesAreSampleFiles"] = (appStatus as Record<string, unknown>)["currentFilesAreSampleFiles"]
    }
    delete next["appStatus"]

    return next as T
}

// v11 (Slice 10b): the seven durable ex-appSettings prefs + the ex-dynamicSettings sortingOption moved
// out of the appSettings/dynamicSettings grab-bags into a brand-new preferences root, and both now-empty
// grab-bags are dropped. Like v6/v7 this CREATES a new root: an old (v10-shaped) blob has no preferences.
// Build it fresh from defaultPreferences + the moved keys, so the rehydrate applier finds them under
// preferences instead of silently reverting them to defaults — same silent-data-loss landmine the v3–v10
// transforms close.
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
        ...((record["preferences"] as Record<string, unknown>) ?? {})
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

// v12 (Slice 10c): the two file-explorer sort prefs merged into one `sorting` object WITHIN the
// preferences home — preferences.sortingOption + preferences.sortingOrderAscending →
// preferences.sorting = { option, orderAscending }. Unlike v3–v11 (which MOVE keys between homes),
// this NESTS two sibling keys inside the already-existing preferences root. Re-shape a persisted blob
// so the rehydrate applier finds the merged `sorting` object instead of silently reverting it to
// defaults — same silent-data-loss landmine the v3–v11 transforms close.
export function migrateCcStateRecordToV12<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const preferences = record["preferences"]
    if (!preferences || typeof preferences !== "object") {
        return state
    }
    const trimmed = { ...(preferences as Record<string, unknown>) }
    const option = "sortingOption" in trimmed ? trimmed["sortingOption"] : defaultSorting.option
    const orderAscending = "sortingOrderAscending" in trimmed ? trimmed["sortingOrderAscending"] : defaultSorting.orderAscending
    delete trimmed["sortingOption"]
    delete trimmed["sortingOrderAscending"]
    trimmed["sorting"] = { option, orderAscending }
    return { ...record, preferences: trimmed } as T
}

export async function writeCcState(state: CcState) {
    const database = await openCodeChartaDB()
    const tx = database.transaction(CCSTATE_STORE_NAME, "readwrite")
    await tx.store.put({
        [CCSTATE_PRIMARY_KEY]: CCSTATE_STATE_ID,
        state
    })
    await tx.done
}

export async function readCcState(): Promise<CcState | null> {
    const database = await openCodeChartaDB()
    const record = await database.get(CCSTATE_STORE_NAME, CCSTATE_STATE_ID)
    return record?.state || null
}

export async function deleteCcState() {
    const database = await openCodeChartaDB()
    const tx = database.transaction(CCSTATE_STORE_NAME, "readwrite")
    await tx.store.delete(CCSTATE_STATE_ID)
    await tx.done
}

export async function openCodeChartaDB() {
    return openDB(DB_NAME, DB_VERSION, {
        async upgrade(database, oldVersion, _newVersion, transaction) {
            if (!database.objectStoreNames.contains(CCSTATE_STORE_NAME)) {
                database.createObjectStore(CCSTATE_STORE_NAME, { keyPath: CCSTATE_PRIMARY_KEY })
            }
            if (!database.objectStoreNames.contains(SCENARIOS_STORE_NAME)) {
                database.createObjectStore(SCENARIOS_STORE_NAME, { keyPath: "id" })
            }
            // Existing DBs (oldVersion >= 1) may hold an older-shaped CcState blob; re-home its
            // map-view settings into mapState, its focus/search/blacklist/markedPackages into sharedView,
            // its attributeTypes/attributeDescriptors into metricsLensSource, its file-provenance flags
            // (isLoadingFile/currentFilesAreSampleFiles) into their own top-level fileStore roots, and its
            // durable prefs (appSettings + dynamicSettings.sortingOption) into a preferences root, and
            // merge its two sort prefs into preferences.sorting. Migrations chain: v2 blobs run
            // v3→…→v12; a v11 blob runs only v12. A brand-new DB (oldVersion 0) has no record to migrate.
            if (oldVersion > 0 && oldVersion < DB_VERSION) {
                const store = transaction.objectStore(CCSTATE_STORE_NAME)
                const record = await store.get(CCSTATE_STATE_ID)
                if (record?.state) {
                    let migrated = record.state
                    if (oldVersion < 3) {
                        migrated = migrateCcStateRecordToV3(migrated)
                    }
                    if (oldVersion < 4) {
                        migrated = migrateCcStateRecordToV4(migrated)
                    }
                    if (oldVersion < 5) {
                        migrated = migrateCcStateRecordToV5(migrated)
                    }
                    if (oldVersion < 6) {
                        migrated = migrateCcStateRecordToV6(migrated)
                    }
                    if (oldVersion < 7) {
                        migrated = migrateCcStateRecordToV7(migrated)
                    }
                    if (oldVersion < 8) {
                        migrated = migrateCcStateRecordToV8(migrated)
                    }
                    if (oldVersion < 9) {
                        migrated = migrateCcStateRecordToV9(migrated)
                    }
                    if (oldVersion < 10) {
                        migrated = migrateCcStateRecordToV10(migrated)
                    }
                    if (oldVersion < 11) {
                        migrated = migrateCcStateRecordToV11(migrated)
                    }
                    if (oldVersion < 12) {
                        migrated = migrateCcStateRecordToV12(migrated)
                    }
                    await store.put({ ...record, state: migrated })
                }
            }
        }
    })
}
