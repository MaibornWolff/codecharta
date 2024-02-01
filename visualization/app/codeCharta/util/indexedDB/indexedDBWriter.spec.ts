import "core-js/stable/structured-clone"
import "fake-indexeddb/auto"
import { openDB } from "idb"
import { defaultState } from "../../state/store/state.manager"
import {
	CCSTATE_PRIMARY_KEY,
	CCSTATE_STATE_ID,
	CCSTATE_STORE_NAME,
	DB_NAME,
	DB_VERSION,
	readCcState,
	writeCcState
} from "./indexedDBWriter"

describe("IndexedDBWriter", () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	describe("writeCcState", () => {
		it("should successfully write state to the database", async () => {
			await writeCcState(defaultState)

			const database = await openDB(DB_NAME, DB_VERSION)
			const transaction = database.transaction(CCSTATE_STORE_NAME, "readonly")
			const store = transaction.objectStore(CCSTATE_STORE_NAME)
			const result = await store.get(CCSTATE_STATE_ID)

			expect(result.state).toEqual(defaultState)

			database.close()
		})
	})

	describe("readCcState", () => {
		it("should successfully read the state from the database", async () => {
			const database = await openDB(DB_NAME, DB_VERSION, {
				upgrade(database_) {
					if (!database_.objectStoreNames.contains(CCSTATE_STORE_NAME)) {
						database_.createObjectStore(CCSTATE_STORE_NAME, { keyPath: CCSTATE_PRIMARY_KEY })
					}
				}
			})
			const transaction = database.transaction(CCSTATE_STORE_NAME, "readwrite")
			await transaction.store.clear()
			const store = transaction.objectStore(CCSTATE_STORE_NAME)
			await store.put({ id: CCSTATE_STATE_ID, state: defaultState })
			await transaction.done
			database.close()

			const state = await readCcState()

			expect(state).toEqual(defaultState)
		})

		it("should return null if the state cannot be read", async () => {
			const database = await openDB(DB_NAME, DB_VERSION, {
				upgrade(database_) {
					if (!database_.objectStoreNames.contains(CCSTATE_STORE_NAME)) {
						database_.createObjectStore(CCSTATE_STORE_NAME, { keyPath: CCSTATE_PRIMARY_KEY })
					}
				}
			})
			const transaction = database.transaction(CCSTATE_STORE_NAME, "readwrite")
			await transaction.store.clear()
			await transaction.done
			database.close()
			const state = await readCcState()

			expect(state).toBeNull()
		})
	})
})
