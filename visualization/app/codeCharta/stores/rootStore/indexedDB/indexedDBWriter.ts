import { CcState } from "app/codeCharta/model/codeCharta.model"
import { FileState } from "app/codeCharta/model/files/files"
import { openDB } from "idb"
import { beginPendingSave, endPendingSave } from "../../../util/busy/isPendingSave"
import { CCSTATE_RECORD_MIGRATIONS, migrateCcStateRecord } from "./migrations/ccStateRecordMigrations"
import { withSeededFileSetting } from "./migrations/seedDefaults"

export const DB_NAME = "CodeCharta"
export const DB_VERSION = 35
export const CCSTATE_STORE_NAME = "ccstate"
export const SCENARIOS_STORE_NAME = "scenarios"
export const CCSTATE_PRIMARY_KEY = "id"
export const CCSTATE_STATE_ID = 1001
/** The loaded files live in their own record, so saving a setting does not re-write every loaded map. */
const CCSTATE_FILES_ID = 1002

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

/** Only a write carrying the loaded maps is felt, as it structured-clones every one on the main thread. A spinner
 * over an imperceptible settings write would read as if a metric change had cost something. */
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

export function isFilesWriteDue(files: FileState[]): boolean {
    return !holdsThePersistedFileStates(files)
}

export async function writeCcFiles(files: FileState[]) {
    if (!isFilesWriteDue(files)) {
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
    const files = withSeededDependencyLens(filesRecord?.files ?? settingsRecord.state.files ?? [])
    persistedFiles = files
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

const DEPENDENCY_LENS_FILE_SETTINGS = ["dependencyLevels", "dependencyDeclarations"]

/** Files persisted before the dependency lens grew levels or declarations carry neither. They are seeded as they
 * are read, not by an upgrade transform, because the upgrade leaves the files record unread. */
function withSeededDependencyLens(files: FileState[]): FileState[] {
    return files.map(
        fileState =>
            DEPENDENCY_LENS_FILE_SETTINGS.reduce<unknown>((seeded, key) => withSeededFileSetting(seeded, key), fileState) as FileState
    )
}

function withoutFiles(state: CcState): Omit<CcState, "files"> {
    const { files, ...settings } = state
    return settings
}

/** Drops the derived word bank, also from a record read back, as a stale one would win over the rebuilt one. The key is
 * omitted, never emptied: the restore applies the persisted lens source over the rebuilt bank, so `words: {}` wipes it. */
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

export function openCodeChartaDB() {
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
