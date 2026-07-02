import { CcState } from "app/codeCharta/codeCharta.model"
import { defaultMapState } from "../../mapState/mapState.facade"
import { openDB } from "idb"

export const DB_NAME = "CodeCharta"
export const DB_VERSION = 5
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
            // map-view settings into mapState. Migrations chain: v2 blobs run v3→v4→v5; a v4 blob
            // runs only v5. A brand-new DB (oldVersion 0) has no record to migrate.
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
                    await store.put({ ...record, state: migrated })
                }
            }
        }
    })
}
