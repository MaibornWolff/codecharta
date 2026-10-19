import "fake-indexeddb/auto"
import { IDBFactory } from "fake-indexeddb"
import { openDB } from "idb"
import { AttributeTypeValue, ColorMode, LayoutAlgorithm } from "../../../model/codeCharta.model"
import { isPendingSave$ } from "../../../util/busy/isPendingSave"
import { defaultPreferences } from "../../preferences/preferences.read.facade"
import { defaultSharedView } from "../../sharedView/sharedView.read.facade"
import { defaultState } from "../state.manager"
import {
    CCSTATE_PRIMARY_KEY,
    CCSTATE_STATE_ID,
    CCSTATE_STORE_NAME,
    DB_NAME,
    DB_VERSION,
    deleteCcState,
    readCcState,
    SCENARIOS_STORE_NAME,
    writeCcFiles,
    writeCcState
} from "./indexedDBWriter"

describe("openCodeChartaDB upgrade (v2 blob → every chained transform up to DB_VERSION)", () => {
    it("should re-home a persisted v2-shaped CcState blob when the DB upgrades", async () => {
        // Runs first (before any higher-version connection is opened) so a fresh fake-indexeddb starts at v2.
        const v2Database = await openDB(DB_NAME, 2, {
            upgrade(database) {
                if (!database.objectStoreNames.contains(CCSTATE_STORE_NAME)) {
                    database.createObjectStore(CCSTATE_STORE_NAME, { keyPath: CCSTATE_PRIMARY_KEY })
                }
                if (!database.objectStoreNames.contains(SCENARIOS_STORE_NAME)) {
                    database.createObjectStore(SCENARIOS_STORE_NAME, { keyPath: "id" })
                }
            }
        })
        // A pre-Slice-5 v2 blob keeps the appearance keys + layoutAlgorithm under appSettings, the
        // color/margin stragglers under dynamicSettings, and the interaction ids under appStatus.
        const v2ShapeState = {
            ...defaultState,
            appSettings: {
                ...defaultPreferences,
                // defaultPreferences no longer spreads a flat sort-order key (Slice 10c merged it into
                // `sorting`), so seed the pre-Slice-10c flat key explicitly — v11 lifts it into
                // preferences and v12 nests it into preferences.sorting.orderAscending.
                sortingOrderAscending: false,
                isLoadingFile: false,
                experimentalFeaturesEnabled: true,
                invertHeight: true,
                amountOfTopLabels: 7,
                layoutAlgorithm: LayoutAlgorithm.StreetMap
            },
            dynamicSettings: {
                sortingOption: "NAME",
                colorMode: ColorMode.absolute,
                margin: 42,
                areaMetric: "rloc",
                focusedNodePath: ["/root/ParentLeaf"],
                searchPattern: "needle"
            },
            fileSettings: {
                edges: [],
                blacklist: [{ path: "/root/excluded", type: "exclude" }],
                markedPackages: [{ path: "/root/src", color: "#FF0000" }],
                attributeTypes: { nodes: { rloc: AttributeTypeValue.absolute }, edges: {} },
                attributeDescriptors: { rloc: { title: "Lines of Code" } }
            },
            appStatus: { currentFilesAreSampleFiles: true, hoveredNodeId: 5 }
        }
        delete (v2ShapeState as { mapState?: unknown }).mapState
        delete (v2ShapeState as { sharedView?: unknown }).sharedView
        delete (v2ShapeState as { metricsLensSource?: unknown }).metricsLensSource
        // A pre-Slice-14 v2 blob had no dependencyLensSource root (defaultState now spreads it in).
        delete (v2ShapeState as { dependencyLensSource?: unknown }).dependencyLensSource
        // A pre-Slice-10 v2 blob had no top-level fileStore flag roots — they lived nested under
        // appSettings.isLoadingFile / appStatus.currentFilesAreSampleFiles (which defaultState no longer spreads).
        delete (v2ShapeState as { isLoadingFile?: unknown }).isLoadingFile
        delete (v2ShapeState as { currentFilesAreSampleFiles?: unknown }).currentFilesAreSampleFiles
        await v2Database.put(CCSTATE_STORE_NAME, { [CCSTATE_PRIMARY_KEY]: CCSTATE_STATE_ID, state: v2ShapeState })
        v2Database.close()

        // openCodeChartaDB (v16, invoked by readCcState) chains the v3…v15 then v16 upgrade transforms.
        const migratedState = (await readCcState()) as unknown as {
            appSettings?: Record<string, unknown>
            dynamicSettings?: Record<string, unknown>
            appStatus?: Record<string, unknown>
            preferences: Record<string, unknown>
            mapState: Record<string, unknown>
            sharedView: Record<string, unknown>
            fileSettings?: Record<string, unknown>
            metricsLensSource: Record<string, unknown>
            dependencyLensSource: Record<string, unknown>
            isLoadingFile: boolean
            currentFilesAreSampleFiles: boolean
        }

        // v3 re-home (appearance keys + layoutAlgorithm out of appSettings)
        expect(migratedState.mapState.invertHeight).toBe(true)
        expect(migratedState.mapState.amountOfTopLabels).toBe(7)
        expect(migratedState.mapState.layoutAlgorithm).toBe(LayoutAlgorithm.StreetMap)
        // v4 re-home (stragglers out of dynamicSettings; the interaction id v4 pulled out of appStatus is
        // relocated again by v14 below)
        expect(migratedState.mapState.colorMode).toBe(ColorMode.absolute)
        expect(migratedState.mapState.margin).toBe(42)
        // v5 re-home (metric selection out of dynamicSettings)
        expect(migratedState.mapState.areaMetric).toBe("rloc")
        // v6 re-home (focus/search out of dynamicSettings into a brand-new sharedView root)
        expect(migratedState.sharedView.focusedNodePath).toEqual(["/root/ParentLeaf"])
        expect(migratedState.sharedView.searchPattern).toBe("needle")
        // v7 re-home (attributeTypes/descriptors out of fileSettings into a brand-new metricsLensSource root; the
        // attributeTypes container is unwrapped again by v16 below)
        expect(migratedState.metricsLensSource.attributeDescriptors).toEqual({ rloc: { title: "Lines of Code" } })
        // v8 re-home (blacklist out of fileSettings into the existing sharedView root), then the v22 split
        expect(migratedState.sharedView.excludedNodes).toEqual([{ path: "/root/excluded" }])
        expect(migratedState.sharedView.flattenedNodes).toEqual([])
        // v9 re-home (markedPackages out of fileSettings into the existing sharedView root)
        expect(migratedState.sharedView.markedPackages).toEqual([{ path: "/root/src", color: "#FF0000" }])
        // v10 re-home (file-provenance flags out of appSettings/appStatus into their own top-level roots; appStatus deleted)
        expect(migratedState.isLoadingFile).toBe(false)
        expect(migratedState.currentFilesAreSampleFiles).toBe(true)
        expect(migratedState.appStatus).toBeUndefined()
        // v11 re-home (durable prefs out of appSettings + dynamicSettings.sortingOption into a new preferences root; both grab-bags deleted)
        expect(migratedState.preferences.experimentalFeaturesEnabled).toBe(true)
        expect(migratedState.appSettings).toBeUndefined()
        expect(migratedState.dynamicSettings).toBeUndefined()
        // v12 sort-merge (the two flat sort prefs nested into one preferences.sorting object)
        expect(migratedState.preferences.sorting).toEqual({ option: "NAME", orderAscending: false })
        expect("sortingOption" in migratedState.preferences).toBe(false)
        expect("sortingOrderAscending" in migratedState.preferences).toBe(false)
        // v14 re-home (interaction ids move mapState → sharedView, nulled — never restored from a stale ordinal)
        expect("hoveredNodeId" in migratedState.mapState).toBe(false)
        expect("selectedBuildingId" in migratedState.mapState).toBe(false)
        expect("rightClickedNodeData" in migratedState.mapState).toBe(false)
        expect(migratedState.sharedView.hoveredNodeId).toBeNull()
        expect(migratedState.sharedView.selectedBuildingId).toBeNull()
        expect(migratedState.sharedView.rightClickedNodeData).toBeNull()
        // v15 drop (edges was the last fileSettings member; it is now a derived dependency-lens selector, so
        // the whole fileSettings root is removed from the persisted blob)
        expect(migratedState.fileSettings).toBeUndefined()
        // v16 unwrap (v13 split the halves but kept the { nodes, edges } container on both sides; each lens source
        // now persists only the flat map it owns)
        expect(migratedState.metricsLensSource.attributeTypes).toEqual({ rloc: AttributeTypeValue.absolute })
        expect(migratedState.dependencyLensSource.attributeTypes).toEqual({})
    })
})

describe("openCodeChartaDB upgrade (v19 blob → v20 transform)", () => {
    const sharedFactory = globalThis.indexedDB

    beforeEach(() => {
        globalThis.indexedDB = new IDBFactory()
    })

    afterEach(() => {
        globalThis.indexedDB = sharedFactory
    })

    it("should restore a session saved before metric rules with no metric rules", async () => {
        // Arrange
        const v19Database = await openDB(DB_NAME, 19, {
            upgrade(database) {
                database.createObjectStore(CCSTATE_STORE_NAME, { keyPath: CCSTATE_PRIMARY_KEY })
                database.createObjectStore(SCENARIOS_STORE_NAME, { keyPath: "id" })
            }
        })
        const v19SharedView = { ...defaultSharedView }
        delete (v19SharedView as { metricRules?: unknown }).metricRules
        await v19Database.put(CCSTATE_STORE_NAME, {
            [CCSTATE_PRIMARY_KEY]: CCSTATE_STATE_ID,
            state: { ...defaultState, sharedView: v19SharedView }
        })
        v19Database.close()

        // Act
        const migratedState = await readCcState()

        // Assert
        expect(migratedState.sharedView.metricRules).toEqual([])
    })

    it("should restore the files of a session saved before they had a record of their own", async () => {
        // Arrange — up to v21 the files sat inside the settings record
        const loadedFiles = [{ file: { fileMeta: { fileName: "before-the-split.cc.json" } }, selectedAs: "Partial" }]
        const v21Database = await openDB(DB_NAME, 21, {
            upgrade(database) {
                database.createObjectStore(CCSTATE_STORE_NAME, { keyPath: CCSTATE_PRIMARY_KEY })
                database.createObjectStore(SCENARIOS_STORE_NAME, { keyPath: "id" })
            }
        })
        await v21Database.put(CCSTATE_STORE_NAME, {
            [CCSTATE_PRIMARY_KEY]: CCSTATE_STATE_ID,
            state: { ...defaultState, files: loadedFiles }
        })
        v21Database.close()

        // Act
        const migratedState = await readCcState()

        // Assert
        expect(migratedState.files).toEqual(loadedFiles)
    })

    it("should drop the derived word bank a session saved before the split still carries", async () => {
        // Arrange — up to v21 the settings record held the merged bank too
        const v21Database = await openDB(DB_NAME, 21, {
            upgrade(database) {
                database.createObjectStore(CCSTATE_STORE_NAME, { keyPath: CCSTATE_PRIMARY_KEY })
                database.createObjectStore(SCENARIOS_STORE_NAME, { keyPath: "id" })
            }
        })
        await v21Database.put(CCSTATE_STORE_NAME, {
            [CCSTATE_PRIMARY_KEY]: CCSTATE_STATE_ID,
            state: { ...defaultState, domainLensSource: { words: { "/root": [{ text: "invoice", frequency: 10 }] } } }
        })
        v21Database.close()

        // Act
        const restored = await readCcState()

        // Assert — a stale bank reaching the restore would be applied over the rebuilt one
        expect(restored.domainLensSource).not.toHaveProperty("words")
    })

    it("should seed the folder colouring on preferences persisted at v23", async () => {
        // Arrange
        const { radialFolderValue, radialFolderStyle, radialFolderTint, ...preferencesBeforeV24 } = defaultState.preferences
        const v23Database = await openDB(DB_NAME, 23, {
            upgrade(database) {
                database.createObjectStore(CCSTATE_STORE_NAME, { keyPath: CCSTATE_PRIMARY_KEY })
                database.createObjectStore(SCENARIOS_STORE_NAME, { keyPath: "id" })
            }
        })
        await v23Database.put(CCSTATE_STORE_NAME, {
            [CCSTATE_PRIMARY_KEY]: CCSTATE_STATE_ID,
            state: { ...defaultState, preferences: preferencesBeforeV24 }
        })
        v23Database.close()

        // Act
        const restored = await readCcState()

        // Assert
        expect(restored.preferences).toEqual({ ...preferencesBeforeV24, radialFolderValue, radialFolderStyle, radialFolderTint })
    })

    it("should not rewrite the persisted record when a session only predates the files split", async () => {
        // Arrange
        const loadedFiles = [{ file: { fileMeta: { fileName: "untouched.cc.json" } }, selectedAs: "Partial" }]
        const v21Database = await openDB(DB_NAME, 21, {
            upgrade(database) {
                database.createObjectStore(CCSTATE_STORE_NAME, { keyPath: CCSTATE_PRIMARY_KEY })
                database.createObjectStore(SCENARIOS_STORE_NAME, { keyPath: "id" })
            }
        })
        await v21Database.put(CCSTATE_STORE_NAME, {
            [CCSTATE_PRIMARY_KEY]: CCSTATE_STATE_ID,
            state: { ...defaultState, files: loadedFiles }
        })
        v21Database.close()

        // Act
        await readCcState()

        // Assert — rewriting it would copy the whole session during boot and exhaust the heap
        const result = await stubReadCcState()
        expect(result.state.files).toEqual(loadedFiles)
    })

    it("should keep the files of a session that predates the split when a setting is saved first", async () => {
        // Arrange — the settings record still holds the files, and no files record exists yet
        const loadedFiles = [{ file: { fileMeta: { fileName: "kept-on-first-save.cc.json" } }, selectedAs: "Partial" }]
        const v21Database = await openDB(DB_NAME, 21, {
            upgrade(database) {
                database.createObjectStore(CCSTATE_STORE_NAME, { keyPath: CCSTATE_PRIMARY_KEY })
                database.createObjectStore(SCENARIOS_STORE_NAME, { keyPath: "id" })
            }
        })
        await v21Database.put(CCSTATE_STORE_NAME, {
            [CCSTATE_PRIMARY_KEY]: CCSTATE_STATE_ID,
            state: { ...defaultState, files: loadedFiles }
        })
        v21Database.close()

        // Act — a settings save strips the files out of that record
        await writeCcState({ ...defaultState, files: loadedFiles } as never)

        // Assert — so it has to put them in their own record first, or the session is gone
        const restored = await readCcState()
        expect(restored.files).toEqual(loadedFiles)
    })

    it("should seed empty dependency levels on the files of a session that predates the files split", async () => {
        // Arrange
        const loadedFiles = [{ file: { settings: { fileSettings: { domainWords: {} } } } }]
        const v21Database = await openDB(DB_NAME, 21, {
            upgrade(database) {
                database.createObjectStore(CCSTATE_STORE_NAME, { keyPath: CCSTATE_PRIMARY_KEY })
                database.createObjectStore(SCENARIOS_STORE_NAME, { keyPath: "id" })
            }
        })
        await v21Database.put(CCSTATE_STORE_NAME, {
            [CCSTATE_PRIMARY_KEY]: CCSTATE_STATE_ID,
            state: { ...defaultState, files: loadedFiles }
        })
        v21Database.close()

        // Act
        const restored = await readCcState()

        // Assert
        expect(restored.files[0].file.settings.fileSettings.dependencyLevels).toEqual({})
    })
})

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
            expect(restored.files[0].file.settings.fileSettings).toEqual({
                ...fileSettings,
                dependencyLevels: {},
                dependencyDeclarations: {}
            })
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
