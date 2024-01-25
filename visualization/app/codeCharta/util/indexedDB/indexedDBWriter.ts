import { openDB } from "idb"
import { CcState } from "app/codeCharta/codeCharta.model"

const DB_NAME = "CodeCharta"
const DB_VERSION = 1
const CCSTATE_STORE_NAME = "ccstate"
const CCSTATE_PRIMARY_KEY = "id"
const CCSTATE_STATE_ID = 1001

export async function saveCcState(state: CcState) {
	const database = await createOrOpenCcStateStore()
	const tx = database.transaction(CCSTATE_STORE_NAME, "readwrite")
	await tx.store.put({
		[CCSTATE_PRIMARY_KEY]: CCSTATE_STATE_ID,
		state
	})
	await tx.done
}

export async function loadCcState(): Promise<CcState | null> {
	const database = await createOrOpenCcStateStore()
	const record = await database.get(CCSTATE_STORE_NAME, CCSTATE_STATE_ID)
	return record?.state || null
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
