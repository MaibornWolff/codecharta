import { CcState } from "app/codeCharta/codeCharta.model"
import { openDB } from "idb"

export const DB_NAME = "CodeCharta"
export const DB_VERSION = 1
export const CCSTATE_STORE_NAME = "ccstate"
export const CCSTATE_PRIMARY_KEY = "id"
export const CCSTATE_STATE_ID = 1001

export async function writeCcState(state: CcState) {
    const database = await createOrOpenCcStateStore()
    const tx = database.transaction(CCSTATE_STORE_NAME, "readwrite")
    await tx.store.put({
        [CCSTATE_PRIMARY_KEY]: CCSTATE_STATE_ID,
        state
    })
    await tx.done
}

export async function readCcState(): Promise<CcState | null> {
    const database = await createOrOpenCcStateStore()
    const record = await database.get(CCSTATE_STORE_NAME, CCSTATE_STATE_ID)
    return record?.state || null
}

export async function deleteCcState() {
    const database = await createOrOpenCcStateStore()
    const tx = database.transaction(CCSTATE_STORE_NAME, "readwrite")
    await tx.store.delete(CCSTATE_STATE_ID)
    await tx.done
}

async function createOrOpenCcStateStore() {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(database) {
            if (!database.objectStoreNames.contains(CCSTATE_STORE_NAME)) {
                database.createObjectStore(CCSTATE_STORE_NAME, { keyPath: CCSTATE_PRIMARY_KEY })
            }
        }
    })
}
