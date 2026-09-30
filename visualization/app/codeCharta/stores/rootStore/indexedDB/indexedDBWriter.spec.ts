import "fake-indexeddb/auto"
import { IDBFactory } from "fake-indexeddb"
import { openDB } from "idb"
import { isPendingSave$ } from "../../../util/busy/isPendingSave"
import { defaultState } from "../state.manager"
import {
    CCSTATE_PRIMARY_KEY,
    CCSTATE_STATE_ID,
    CCSTATE_STORE_NAME,
    DB_NAME,
    DB_VERSION,
    deleteCcState,
    readCcState,
    writeCcFiles,
    writeCcState
} from "./indexedDBWriter"

describe("IndexedDBWriter", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe("writeCcState", () => {
        it("should write the settings without the loaded files, which have a record of their own", async () => {
            // Act
            await writeCcState(defaultState)

            // Assert — a write copies its value on the main thread, so a setting must not carry the maps
            const result = await stubReadCcState()
            expect(result.state).not.toHaveProperty("files")
            expect(result.state.mapState).toEqual(defaultState.mapState)
        })

        it("should leave the loaded files alone", async () => {
            // Arrange
            const loadedFiles = [{ file: { fileMeta: { fileName: "kept.cc.json" } }, selectedAs: "Partial" }] as never

            // Act
            await writeCcFiles(loadedFiles)
            await writeCcState(defaultState)

            // Assert
            const restored = await readCcState()
            expect(restored.files).toEqual(loadedFiles)
        })

        it("should leave the derived word bank out of the record entirely, rather than persisting it empty", async () => {
            // Arrange — the bank is rebuilt from the loaded files on every load
            const stateWithMergedBank = {
                ...defaultState,
                domainLensSource: { words: { "/root": [{ text: "invoice", frequency: 10 }] } }
            }

            // Act
            await writeCcState(stateWithMergedBank)

            // Assert — an empty bank that is PRESENT would be applied over the rebuilt one and wipe it
            const result = await stubReadCcState()
            expect(result.state.domainLensSource).not.toHaveProperty("words")
        })

        it("should commit the write with strict durability so a confirmed save survives a storage-process crash", async () => {
            // Arrange
            const transactionSpy = jest.spyOn(IDBDatabase.prototype, "transaction")

            // Act
            await writeCcState(defaultState)

            // Assert
            expect(transactionSpy).toHaveBeenCalledWith(CCSTATE_STORE_NAME, "readwrite", { durability: "strict" })
            transactionSpy.mockRestore()
        })
    })

    describe("the spinner the save raises", () => {
        const pendingSavesDuring = async (write: () => Promise<void>) => {
            let wasPending = false
            const subscription = isPendingSave$.subscribe(isPending => {
                wasPending ||= isPending
            })
            await write()
            subscription.unsubscribe()
            return wasPending
        }

        it("should stay down while a settings change is written", async () => {
            // Arrange — the files have a record already, so this write carries no map
            await writeCcFiles([{ file: { fileMeta: { fileName: "loaded.cc.json" } }, selectedAs: "Partial" }] as never)

            // Act
            const raisedSpinner = await pendingSavesDuring(() => writeCcState(defaultState))

            // Assert — a settings write is a handful of names and flags; a spinner over it reads as a cost
            expect(raisedSpinner).toBe(false)
        })

        it("should go up while the loaded maps are written", async () => {
            // Arrange
            const addedMap = [{ file: { fileMeta: { fileName: "added.cc.json" } }, selectedAs: "Partial" }] as never

            // Act
            const raisedSpinner = await pendingSavesDuring(() => writeCcFiles(addedMap))

            // Assert — putting the maps structured-clones every one of them on the main thread
            expect(raisedSpinner).toBe(true)
        })

        it("should go up when a settings write has to move the loaded maps into their own record", async () => {
            // Arrange — a fresh database, so no files record exists yet: a session persisted before
            // the files got a record of their own
            const sharedFactory = globalThis.indexedDB
            globalThis.indexedDB = new IDBFactory()
            const stateHoldingFiles = {
                ...defaultState,
                files: [{ file: { fileMeta: { fileName: "unsplit.cc.json" } }, selectedAs: "Partial" }]
            } as never

            // Act
            const raisedSpinner = await pendingSavesDuring(() => writeCcState(stateHoldingFiles))

            // Assert — this one settings write does copy the maps, so it earns the spinner
            globalThis.indexedDB = sharedFactory
            expect(raisedSpinner).toBe(true)
        })

        it("should put the spinner back down when the write fails", async () => {
            // Arrange
            const putSpy = jest.spyOn(IDBObjectStore.prototype, "put").mockImplementation(() => {
                throw new Error("the quota is exhausted")
            })
            let isPending = true
            const subscription = isPendingSave$.subscribe(value => {
                isPending = value
            })

            // Act
            await expect(
                writeCcFiles([{ file: { fileMeta: { fileName: "doomed.cc.json" } }, selectedAs: "Partial" }] as never)
            ).rejects.toThrow()

            // Assert
            expect(isPending).toBe(false)
            subscription.unsubscribe()
            putSpy.mockRestore()
        })
    })

    describe("writeCcFiles", () => {
        it("should not write back the files it has just read", async () => {
            // Arrange
            await stubWriteCcState()
            await writeCcFiles([{ file: { fileMeta: { fileName: "restored.cc.json" } }, selectedAs: "Partial" }] as never)
            const restored = await readCcState()
            const putSpy = jest.spyOn(IDBObjectStore.prototype, "put")

            // Act — the store sorts a copy, so the save hands back a different array of the same states
            await writeCcFiles([...restored.files])

            // Assert — writing it would clone every loaded map to store what is already stored
            expect(putSpy).not.toHaveBeenCalled()
            putSpy.mockRestore()
        })

        it("should write the files when they are not the ones it last persisted", async () => {
            // Arrange
            await stubWriteCcState()
            await writeCcFiles([{ file: { fileMeta: { fileName: "first.cc.json" } }, selectedAs: "Partial" }] as never)
            const putSpy = jest.spyOn(IDBObjectStore.prototype, "put")

            // Act
            await writeCcFiles([{ file: { fileMeta: { fileName: "second.cc.json" } }, selectedAs: "Partial" }] as never)

            // Assert
            expect(putSpy).toHaveBeenCalled()
            putSpy.mockRestore()
            const restored = await readCcState()
            expect(restored.files[0].file.fileMeta.fileName).toBe("second.cc.json")
        })
    })

    describe("deleteCcState", () => {
        it("should successfully delete state from the database", async () => {
            await stubWriteCcState()
            await deleteCcState()

            const result = await readCcState()

            expect(result).toBeNull()
        })
    })

    describe("readCcState", () => {
        it("should successfully read the state from the database", async () => {
            await stubWriteCcState()
            const state = await readCcState()

            // everything but the derived word bank, which the restore rebuilds from the loaded files
            expect(state).toEqual({ ...defaultState, domainLensSource: {} })
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

        it("should seed empty dependency levels on loaded files persisted before the dependency lens grew levels", async () => {
            // Arrange
            const fileSettings = { attributeTypes: {}, domainWords: {} }
            await writeCcState(defaultState)
            await writeCcFiles([{ selectedAs: "Partial", file: { settings: { fileSettings } } }] as never)

            // Act
            const restored = await readCcState()

            // Assert
            expect(restored.files[0].file.settings.fileSettings).toEqual({ ...fileSettings, dependencyLevels: {} })
            expect(restored.files[0].selectedAs).toBe("Partial")
        })

        it("should leave the file states that already carry dependency levels untouched", async () => {
            // Arrange
            const dependencyLevels = { "/root/a.ts": { level: 2 } }
            await writeCcState(defaultState)
            await writeCcFiles([{ file: { settings: { fileSettings: { dependencyLevels } } } }] as never)

            // Act
            const restored = await readCcState()

            // Assert
            expect(restored.files[0].file.settings.fileSettings.dependencyLevels).toEqual(dependencyLevels)
        })
    })
})

async function stubReadCcState() {
    const database = await openDB(DB_NAME, DB_VERSION)
    const transaction = database.transaction(CCSTATE_STORE_NAME, "readonly")
    const store = transaction.objectStore(CCSTATE_STORE_NAME)
    const result = await store.get(CCSTATE_STATE_ID)
    database.close()

    return result
}

async function stubWriteCcState() {
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
}
