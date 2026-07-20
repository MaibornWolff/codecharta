import { CcState } from "app/codeCharta/model/codeCharta.model"
import { openDB } from "idb"
import { defaultDependencyLensSource } from "../../dependencyLensSource/dependencyLensSource.read.facade"
import { defaultDomainBar } from "../../domainBar/domainBar.read.facade"
import { defaultDomainLensSource } from "../../domainLensSource/domainLensSource.read.facade"
import { defaultMapState } from "../../mapState/mapState.read.facade"
import { defaultMetricsLensSource } from "../../metricsLensSource/metricsLensSource.read.facade"
import { defaultPreferences, defaultSorting } from "../../preferences/preferences.read.facade"
import { defaultSharedView } from "../../sharedView/sharedView.read.facade"

export const DB_NAME = "CodeCharta"
export const DB_VERSION = 18
export const CCSTATE_STORE_NAME = "ccstate"
export const SCENARIOS_STORE_NAME = "scenarios"
export const CCSTATE_PRIMARY_KEY = "id"
export const CCSTATE_STATE_ID = 1001

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

// v4: colorMode/colorRange/margin/layoutAlgorithm/isLoadingMap/interaction ids → mapState
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
    const mapState: Record<string, unknown> = { ...defaultMapState, ...(record["mapState"] as Record<string, unknown>) }
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

// v5: metric selection (areaMetric/heightMetric/colorMetric/edgeMetric/distributionMetric) → mapState
const V5_MOVES: Record<string, string[]> = {
    dynamicSettings: ["areaMetric", "heightMetric", "colorMetric", "edgeMetric", "distributionMetric"]
}

export function migrateCcStateRecordToV5<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const mapState: Record<string, unknown> = { ...defaultMapState, ...(record["mapState"] as Record<string, unknown>) }
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

// v6: focusedNodePath + searchPattern → sharedView (new root; was dynamicSettings)
const V6_MOVES: Record<string, string[]> = {
    dynamicSettings: ["focusedNodePath", "searchPattern"]
}

export function migrateCcStateRecordToV6<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const sharedView: Record<string, unknown> = { ...defaultSharedView, ...(record["sharedView"] as Record<string, unknown>) }
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

// v7: attributeTypes + attributeDescriptors → metricsLensSource (new root; was fileSettings)
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
        ...(record["metricsLensSource"] as Record<string, unknown>)
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

// v8: blacklist → sharedView (was fileSettings)
const V8_MOVES: Record<string, string[]> = {
    fileSettings: ["blacklist"]
}

export function migrateCcStateRecordToV8<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const sharedView: Record<string, unknown> = { ...defaultSharedView, ...(record["sharedView"] as Record<string, unknown>) }
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

// v9: markedPackages → sharedView (was fileSettings)
const V9_MOVES: Record<string, string[]> = {
    fileSettings: ["markedPackages"]
}

export function migrateCcStateRecordToV9<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const sharedView: Record<string, unknown> = { ...defaultSharedView, ...(record["sharedView"] as Record<string, unknown>) }
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

// v10: isLoadingFile → top-level (was appSettings); currentFilesAreSampleFiles → top-level; drop appStatus
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

// v12: sortingOption + sortingOrderAscending → preferences.sorting = { option, orderAscending }
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

// v13: edge attributeTypes → dependencyLensSource (new root; was metricsLensSource.attributeTypes.edges)
export function migrateCcStateRecordToV13<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const dependencyLensSource: Record<string, unknown> = {
        ...defaultDependencyLensSource,
        ...(record["dependencyLensSource"] as Record<string, unknown>)
    }
    const next: Record<string, unknown> = { ...record }
    const metricsLensSource = record["metricsLensSource"]
    if (metricsLensSource && typeof metricsLensSource === "object") {
        const trimmed = { ...(metricsLensSource as Record<string, unknown>) }
        const attributeTypes = trimmed["attributeTypes"]
        if (attributeTypes && typeof attributeTypes === "object") {
            const { nodes, edges } = attributeTypes as { nodes?: unknown; edges?: unknown }
            dependencyLensSource["attributeTypes"] = { nodes: {}, edges: edges ?? {} }
            trimmed["attributeTypes"] = { nodes: nodes ?? {}, edges: {} }
        }
        next["metricsLensSource"] = trimmed
    }
    next["dependencyLensSource"] = dependencyLensSource
    return next as T
}

// v14: hoveredNodeId/selectedBuildingId/rightClickedNodeData → sharedView (was mapState; seed as null)
export function migrateCcStateRecordToV14<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const sharedView: Record<string, unknown> = { ...defaultSharedView, ...(record["sharedView"] as Record<string, unknown>) }
    const next: Record<string, unknown> = { ...record }
    const mapState = record["mapState"]
    if (mapState && typeof mapState === "object") {
        const trimmed = { ...(mapState as Record<string, unknown>) }
        delete trimmed["hoveredNodeId"]
        delete trimmed["selectedBuildingId"]
        delete trimmed["rightClickedNodeData"]
        next["mapState"] = trimmed
    }
    sharedView["hoveredNodeId"] = null
    sharedView["selectedBuildingId"] = null
    sharedView["rightClickedNodeData"] = null
    next["sharedView"] = sharedView
    return next as T
}

// v15: drop fileSettings (edges now derives from the dependency lens, not stored)
export function migrateCcStateRecordToV15<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const next: Record<string, unknown> = { ...(state as Record<string, unknown>) }
    delete next["fileSettings"]
    return next as T
}

// v16: each lens source's attributeTypes flattens to the half it owns (metrics keeps nodes, dependency keeps edges)
function unwrapAttributeTypesHalf(source: unknown, half: "nodes" | "edges"): unknown {
    if (!source || typeof source !== "object") {
        return source
    }
    const trimmed = { ...(source as Record<string, unknown>) }
    const attributeTypes = trimmed["attributeTypes"]
    if (!attributeTypes || typeof attributeTypes !== "object") {
        return trimmed
    }
    const container = attributeTypes as Record<string, unknown>
    // a flat map's values are AttributeTypeValue strings, so an object-valued `nodes`/`edges` means the legacy container
    const isLegacyContainer = typeof container["nodes"] === "object" || typeof container["edges"] === "object"
    if (isLegacyContainer) {
        trimmed["attributeTypes"] = container[half] ?? {}
    }
    return trimmed
}

export function migrateCcStateRecordToV16<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const next: Record<string, unknown> = { ...record }
    if ("metricsLensSource" in record) {
        next["metricsLensSource"] = unwrapAttributeTypesHalf(record["metricsLensSource"], "nodes")
    }
    if ("dependencyLensSource" in record) {
        next["dependencyLensSource"] = unwrapAttributeTypesHalf(record["dependencyLensSource"], "edges")
    }
    return next as T
}

// v17: seed the domainLensSource root (the path-keyed domain word bank) so a blob written before the
// domain lens existed still carries the root the restore path reads directly. The words are re-derived
// from the file on every load, so an empty default is correct here.
export function migrateCcStateRecordToV17<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    if (record["domainLensSource"]) {
        return state
    }
    return { ...record, domainLensSource: defaultDomainLensSource } as T
}

// v18: seed the domainBar root (the word-cloud render controls) so a blob written before the domain
// settings bar existed still carries the root the store expects. Defaults match the DLC render controls.
export function migrateCcStateRecordToV18<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    if (record["domainBar"]) {
        return state
    }
    return { ...record, domainBar: defaultDomainBar } as T
}

export async function writeCcState(state: CcState) {
    const database = await openCodeChartaDB()
    // Strict durability: the default (relaxed) reports success before the data reaches disk, so a
    // browser storage-process crash right after a save can silently lose the whole persisted session.
    const tx = database.transaction(CCSTATE_STORE_NAME, "readwrite", { durability: "strict" })
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

// The persisted CcState record is migrated forward one version at a time: each vN transform reshapes a
// (v(N-1))-shaped blob into vN. A blob written at oldVersion runs every transform whose target version it
// predates, in ascending order (a v2 blob runs v3→…→v18; a v17 blob runs only v18).
const CCSTATE_RECORD_MIGRATIONS: ReadonlyArray<{ version: number; migrate: (state: unknown) => unknown }> = [
    { version: 3, migrate: migrateCcStateRecordToV3 },
    { version: 4, migrate: migrateCcStateRecordToV4 },
    { version: 5, migrate: migrateCcStateRecordToV5 },
    { version: 6, migrate: migrateCcStateRecordToV6 },
    { version: 7, migrate: migrateCcStateRecordToV7 },
    { version: 8, migrate: migrateCcStateRecordToV8 },
    { version: 9, migrate: migrateCcStateRecordToV9 },
    { version: 10, migrate: migrateCcStateRecordToV10 },
    { version: 11, migrate: migrateCcStateRecordToV11 },
    { version: 12, migrate: migrateCcStateRecordToV12 },
    { version: 13, migrate: migrateCcStateRecordToV13 },
    { version: 14, migrate: migrateCcStateRecordToV14 },
    { version: 15, migrate: migrateCcStateRecordToV15 },
    { version: 16, migrate: migrateCcStateRecordToV16 },
    { version: 17, migrate: migrateCcStateRecordToV17 },
    { version: 18, migrate: migrateCcStateRecordToV18 }
]

function migrateCcStateRecord(state: unknown, oldVersion: number): unknown {
    let migrated = state
    for (const { version, migrate } of CCSTATE_RECORD_MIGRATIONS) {
        if (oldVersion < version) {
            migrated = migrate(migrated)
        }
    }
    return migrated
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
            // Migrate persisted blobs forward through all applicable transforms (v3→…→v18).
            if (oldVersion > 0 && oldVersion < DB_VERSION) {
                const store = transaction.objectStore(CCSTATE_STORE_NAME)
                const record = await store.get(CCSTATE_STATE_ID)
                if (record?.state) {
                    const migrated = migrateCcStateRecord(record.state, oldVersion)
                    await store.put({ ...record, state: migrated })
                }
            }
        }
    })
}
