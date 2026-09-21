import { CcState } from "app/codeCharta/model/codeCharta.model"
import { FileState } from "app/codeCharta/model/files/files"
import { openDB } from "idb"
import { beginPendingSave, endPendingSave } from "../../../util/busy/isPendingSave"
import { defaultDependencyLensSource } from "../../dependencyLensSource/dependencyLensSource.read.facade"
import { defaultDomainLensSource } from "../../domainLensSource/domainLensSource.read.facade"
import { defaultDomainState } from "../../domainState/domainState.read.facade"
import { defaultMapState } from "../../mapState/mapState.read.facade"
import { defaultMetricsLensSource } from "../../metricsLensSource/metricsLensSource.read.facade"
import { defaultCenterMapZoom, defaultPreferences, defaultSorting } from "../../preferences/preferences.read.facade"
import { defaultSharedView } from "../../sharedView/sharedView.read.facade"

export const DB_NAME = "CodeCharta"
export const DB_VERSION = 23
export const CCSTATE_STORE_NAME = "ccstate"
export const SCENARIOS_STORE_NAME = "scenarios"
export const CCSTATE_PRIMARY_KEY = "id"
export const CCSTATE_STATE_ID = 1001
/** The loaded files live in their own record, so saving a setting does not re-write every loaded map. */
const CCSTATE_FILES_ID = 1002

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

function seedRootIfAbsent<T>(state: T, key: string, defaultValue: unknown): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    if (record[key]) {
        return state
    }
    return { ...record, [key]: defaultValue } as T
}

export function migrateCcStateRecordToV17<T>(state: T): T {
    return seedRootIfAbsent(state, "domainLensSource", defaultDomainLensSource)
}

export function migrateCcStateRecordToV18<T>(state: T): T {
    return seedRootIfAbsent(state, "domainState", defaultDomainState)
}

// v19: file states persisted before the domain lens carry no fileSettings.domainWords
export function migrateCcStateRecordToV19<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const files = record["files"]
    if (!Array.isArray(files)) {
        return state
    }
    return { ...record, files: files.map(withSeededDomainWords) } as T
}

type PersistedFileState = { file?: { settings?: { fileSettings?: Record<string, unknown> } } }

function withSeededDomainWords(fileState: unknown): unknown {
    const fileSettings = (fileState as PersistedFileState)?.file?.settings?.fileSettings
    if (!fileSettings || typeof fileSettings !== "object" || fileSettings["domainWords"]) {
        return fileState
    }
    const state = fileState as Record<string, unknown>
    const file = state["file"] as Record<string, unknown>
    const settings = file["settings"] as Record<string, unknown>
    return {
        ...state,
        file: { ...file, settings: { ...settings, fileSettings: { ...fileSettings, domainWords: {} } } }
    }
}

// v20: a sharedView persisted before metric rules carries no metricRules
export function migrateCcStateRecordToV20<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const sharedView = record["sharedView"]
    if (!sharedView || typeof sharedView !== "object" || "metricRules" in sharedView) {
        return state
    }
    return { ...record, sharedView: { ...sharedView, metricRules: defaultSharedView.metricRules } } as T
}

// v21: preferences persisted before the centre-map zoom was configurable carry no centerMapZoom
export function migrateCcStateRecordToV21<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const preferences = record["preferences"]
    if (!preferences || typeof preferences !== "object" || "centerMapZoom" in preferences) {
        return state
    }
    return { ...record, preferences: { ...preferences, centerMapZoom: defaultCenterMapZoom } } as T
}

/** The settings without the loaded files: a write structured-clones its value on the main thread, so a
 * setting change must not carry every loaded map along. */
export async function writeCcState(state: CcState) {
    const database = await openCodeChartaDB()
    // Strict durability: the default (relaxed) reports success before the data reaches disk, so a
    // browser storage-process crash right after a save can silently lose the whole persisted session.
    const tx = database.transaction(CCSTATE_STORE_NAME, "readwrite", { durability: "strict" })
    // A session persisted before the split still keeps its files in the settings record, so dropping them
    // before their own record exists would lose them. `getKey` checks that without reading them back.
    const writesTheFilesRecordToo = (await tx.store.getKey(CCSTATE_FILES_ID)) === undefined

    await whileCopyingTheLoadedMaps(writesTheFilesRecordToo, async () => {
        if (writesTheFilesRecordToo) {
            await tx.store.put({ [CCSTATE_PRIMARY_KEY]: CCSTATE_FILES_ID, files: state.files })
        }
        await tx.store.put({
            [CCSTATE_PRIMARY_KEY]: CCSTATE_STATE_ID,
            state: toPersistedSettings(withoutFiles(state))
        })
        await tx.done
        // Only once committed: a cache claiming unwritten files would make every later save skip them.
        if (writesTheFilesRecordToo) {
            persistedFiles = state.files
        }
    })
}

/**
 * Raise the spinner only for a write that carries the loaded maps: putting them structured-clones
 * every one of them on the main thread, which a reader feels. The settings are a handful of names
 * and flags — writing them is imperceptible, and a spinner over it reads as if a metric change had
 * cost something.
 */
async function whileCopyingTheLoadedMaps(copiesTheLoadedMaps: boolean, write: () => Promise<void>) {
    if (!copiesTheLoadedMaps) {
        return write()
    }
    beginPendingSave()
    try {
        await write()
    } finally {
        endPendingSave()
    }
}

/** The files as they were last read or written, so the save a restore triggers does not write them back
 * unchanged — the single most expensive thing a reload does. */
let persistedFiles: readonly FileState[] | null = null

/** Whether these are the file states the record already holds. Compared per file state, not on the array:
 * the store sorts a copy on every `setFiles`, while the states inside stay the same objects. */
function holdsThePersistedFileStates(files: FileState[]): boolean {
    const persisted = persistedFiles
    if (persisted?.length !== files.length) {
        return false
    }
    return files.every(file => persisted.includes(file))
}

export async function writeCcFiles(files: FileState[]) {
    if (holdsThePersistedFileStates(files)) {
        return
    }
    const database = await openCodeChartaDB()
    const tx = database.transaction(CCSTATE_STORE_NAME, "readwrite", { durability: "strict" })
    await whileCopyingTheLoadedMaps(true, async () => {
        await tx.store.put({
            [CCSTATE_PRIMARY_KEY]: CCSTATE_FILES_ID,
            files
        })
        await tx.done
        persistedFiles = files
    })
}

export async function readCcState(): Promise<CcState | null> {
    const database = await openCodeChartaDB()
    const settingsRecord = await database.get(CCSTATE_STORE_NAME, CCSTATE_STATE_ID)
    if (!settingsRecord?.state) {
        return null
    }
    const filesRecord = await database.get(CCSTATE_STORE_NAME, CCSTATE_FILES_ID)
    const files = filesRecord?.files ?? settingsRecord.state.files ?? []
    persistedFiles = files
    // A record written before the split still carries the derived word bank. It is dropped as it is read,
    // because persisted beats file-derived: a stale bank would win over the rebuilt one.
    return { ...toPersistedSettings(settingsRecord.state), files }
}

export async function deleteCcState() {
    const database = await openCodeChartaDB()
    const tx = database.transaction(CCSTATE_STORE_NAME, "readwrite")
    await tx.store.delete(CCSTATE_STATE_ID)
    await tx.store.delete(CCSTATE_FILES_ID)
    await tx.done
    persistedFiles = null
}

function withoutFiles(state: CcState): Omit<CcState, "files"> {
    const { files, ...settings } = state
    return settings
}

/**
 * The settings as they are persisted, without the derived word bank the reconciliation rebuilds anyway.
 *
 * The key is OMITTED, never emptied: the restore applies the persisted lens source over the rebuilt bank,
 * so a `words: {}` present in the blob would wipe it, while an absent key is skipped.
 */
function toPersistedSettings<T>(settings: T): T {
    if (!settings || typeof settings !== "object") {
        return settings
    }
    const record = settings as Record<string, unknown>
    const domainLensSource = record["domainLensSource"]
    if (!domainLensSource || typeof domainLensSource !== "object" || !("words" in domainLensSource)) {
        return settings
    }
    const { words, ...withoutWords } = domainLensSource as Record<string, unknown>
    return { ...record, domainLensSource: withoutWords } as T
}

// The persisted CcState record is migrated forward one version at a time: each vN transform reshapes a
// (v(N-1))-shaped blob into vN. A blob written at oldVersion runs every transform whose target version it
/**
 * v22: the one blacklist, whose entries said what they did, becomes the two lists the app now keeps
 * them in. Exclusion decides which nodes the map holds; flattening only changes how a subtree looks.
 */
export function migrateCcStateRecordToV22<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const sharedView = record["sharedView"]
    if (!sharedView || typeof sharedView !== "object" || !("blacklist" in sharedView)) {
        return state
    }
    const { blacklist, ...sharedViewWithoutBlacklist } = sharedView as Record<string, unknown>
    const nodeRules = Array.isArray(blacklist) ? (blacklist as { path: string; type?: string; nodeType?: string }[]) : []
    const withoutEffect = ({ path, nodeType }: { path: string; nodeType?: string }) => (nodeType ? { path, nodeType } : { path })

    return {
        ...record,
        sharedView: {
            ...sharedViewWithoutBlacklist,
            excludedNodes: nodeRules.filter(rule => rule.type !== "flatten").map(withoutEffect),
            flattenedNodes: nodeRules.filter(rule => rule.type === "flatten").map(withoutEffect)
        }
    } as T
}

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
    { version: 18, migrate: migrateCcStateRecordToV18 },
    { version: 19, migrate: migrateCcStateRecordToV19 },
    { version: 20, migrate: migrateCcStateRecordToV20 },
    { version: 21, migrate: migrateCcStateRecordToV21 },
    { version: 22, migrate: migrateCcStateRecordToV22 }
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
            // Reading the record deserializes the whole session, so a version no transform applies to is
            // left unread rather than migrated.
            const needsRecordMigration = CCSTATE_RECORD_MIGRATIONS.some(({ version }) => oldVersion < version)
            if (oldVersion > 0 && needsRecordMigration) {
                const store = transaction.objectStore(CCSTATE_STORE_NAME)
                const record = await store.get(CCSTATE_STATE_ID)
                const migrated = record?.state ? migrateCcStateRecord(record.state, oldVersion) : undefined
                // Only a shape transform earns a write. Splitting the files out here would clone the whole
                // session during the upgrade — over a gigabyte on a large project, which kills the tab and
                // rolls the upgrade back. The read path copes with an unsplit record; the next save splits it.
                if (migrated !== undefined && migrated !== record.state) {
                    await store.put({ ...record, state: migrated })
                }
            }
        }
    })
}
