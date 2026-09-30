import { CcState } from "app/codeCharta/model/codeCharta.model"
import { FileState } from "app/codeCharta/model/files/files"
import { openDB } from "idb"
import { beginPendingSave, endPendingSave } from "../../../util/busy/isPendingSave"
import { migrateCcStateRecord, needsCcStateRecordMigration } from "./migrations/ccStateRecordMigrations"
import { isPersistedRecord, withoutKeys, withSeededFileSetting } from "./migrations/persistedRecord"

export const DB_NAME = "CodeCharta"
export const DB_VERSION = 25
export const CCSTATE_STORE_NAME = "ccstate"
export const SCENARIOS_STORE_NAME = "scenarios"
export const CCSTATE_PRIMARY_KEY = "id"
export const CCSTATE_STATE_ID = 1001
/** The loaded files live in their own record, so saving a setting does not re-write every loaded map. */
const CCSTATE_FILES_ID = 1002

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
    const files = withSeededDependencyLevels(filesRecord?.files ?? settingsRecord.state.files ?? [])
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

/** Files persisted before the dependency lens grew levels carry no `dependencyLevels`. They are seeded as they are
 * read, not by an upgrade transform, because the upgrade leaves the files record unread. */
function withSeededDependencyLevels(files: FileState[]): FileState[] {
    return files.map(fileState => withSeededFileSetting(fileState, "dependencyLevels") as FileState)
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
    if (!isPersistedRecord(settings) || !isPersistedRecord(settings["domainLensSource"])) {
        return settings
    }
    const domainLensSource = settings["domainLensSource"]
    if (!("words" in domainLensSource)) {
        return settings
    }
    return { ...settings, domainLensSource: withoutKeys(domainLensSource, ["words"]) } as T
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
            if (oldVersion > 0 && needsCcStateRecordMigration(oldVersion)) {
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
