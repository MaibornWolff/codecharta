import { CcState } from "app/codeCharta/codeCharta.model"
import { defaultMapState } from "../../mapState/mapState.facade"
import { openDB } from "idb"

export const DB_NAME = "CodeCharta"
export const DB_VERSION = 3
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
            // Existing DBs (oldVersion >= 1) may hold a v2-shaped CcState blob; re-home its map-view
            // settings into mapState. A brand-new DB (oldVersion 0) has no record to migrate.
            if (oldVersion > 0 && oldVersion < 3) {
                const store = transaction.objectStore(CCSTATE_STORE_NAME)
                const record = await store.get(CCSTATE_STATE_ID)
                if (record?.state) {
                    await store.put({ ...record, state: migrateCcStateRecordToV3(record.state) })
                }
            }
        }
    })
}
