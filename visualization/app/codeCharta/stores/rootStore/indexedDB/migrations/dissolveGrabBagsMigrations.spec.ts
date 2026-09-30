import { defaultPreferences } from "../../../preferences/preferences.read.facade"
import {
    migrateCcStateRecordToV10,
    migrateCcStateRecordToV11,
    migrateCcStateRecordToV12,
    migrateCcStateRecordToV14,
    migrateCcStateRecordToV15
} from "./dissolveGrabBagsMigrations"

describe("migrateCcStateRecordToV10 (Slice 10a re-home transform)", () => {
    const v9ShapeState = () => ({
        appSettings: { maxTreeMapFiles: 100, isLoadingFile: false },
        appStatus: { currentFilesAreSampleFiles: true }
    })

    it("should promote isLoadingFile + currentFilesAreSampleFiles to their own top-level roots", () => {
        const migrated = migrateCcStateRecordToV10(v9ShapeState()) as unknown as {
            isLoadingFile: boolean
            currentFilesAreSampleFiles: boolean
        }

        expect(migrated.isLoadingFile).toBe(false)
        expect(migrated.currentFilesAreSampleFiles).toBe(true)
    })

    it("should drop isLoadingFile from appSettings and delete the now-empty appStatus grab-bag", () => {
        const migrated = migrateCcStateRecordToV10(v9ShapeState()) as unknown as {
            appSettings: Record<string, unknown>
            appStatus?: Record<string, unknown>
        }

        expect("isLoadingFile" in migrated.appSettings).toBe(false)
        expect(migrated.appSettings.maxTreeMapFiles).toBe(100)
        expect(migrated.appStatus).toBeUndefined()
    })

    it("should return the record untouched when it is null, and just drop appStatus when the flags are absent", () => {
        expect(migrateCcStateRecordToV10(null)).toBeNull()
        const migrated = migrateCcStateRecordToV10({ files: [] }) as unknown as { files: unknown[] }
        expect(migrated.files).toEqual([])
        expect("appStatus" in (migrated as object)).toBe(false)
    })
})

describe("migrateCcStateRecordToV11 (Slice 10b re-home transform)", () => {
    const v10ShapeState = () => ({
        appSettings: {
            isPresentationMode: true,
            resetCameraIfNewFileIsLoaded: false,
            sortingOrderAscending: false,
            maxTreeMapFiles: 42,
            experimentalFeaturesEnabled: true,
            screenshotToClipboardEnabled: true,
            isColorMetricLinkedToHeightMetric: true
        },
        dynamicSettings: { sortingOption: "NUMBER_OF_FILES" }
    })

    it("should move the seven appSettings prefs + dynamicSettings.sortingOption into a brand-new preferences root", () => {
        const migrated = migrateCcStateRecordToV11(v10ShapeState()) as unknown as { preferences: Record<string, unknown> }

        expect(migrated.preferences.isPresentationMode).toBe(true)
        expect(migrated.preferences.maxTreeMapFiles).toBe(42)
        expect(migrated.preferences.experimentalFeaturesEnabled).toBe(true)
        expect(migrated.preferences.isColorMetricLinkedToHeightMetric).toBe(true)
        expect(migrated.preferences.sortingOption).toBe("NUMBER_OF_FILES")
    })

    it("should delete both the appSettings and dynamicSettings grab-bags", () => {
        const migrated = migrateCcStateRecordToV11(v10ShapeState()) as unknown as {
            appSettings?: Record<string, unknown>
            dynamicSettings?: Record<string, unknown>
        }

        expect(migrated.appSettings).toBeUndefined()
        expect(migrated.dynamicSettings).toBeUndefined()
    })

    it("should fill preferences keys absent from the old blob with their defaults", () => {
        const migrated = migrateCcStateRecordToV11({ appSettings: {}, dynamicSettings: {} }) as unknown as {
            preferences: Record<string, unknown>
        }

        expect(migrated.preferences.maxTreeMapFiles).toBe(defaultPreferences.maxTreeMapFiles)
        // sortingOption's default is no longer a top-level preference key (merged into `sorting` at v12);
        // v11 now carries the default `sorting` object through its defaultPreferences base spread.
        expect(migrated.preferences.sorting).toEqual(defaultPreferences.sorting)
    })

    it("should return the record untouched when it is null, and build a default preferences when there are no grab-bags", () => {
        expect(migrateCcStateRecordToV11(null)).toBeNull()
        const migrated = migrateCcStateRecordToV11({ files: [] }) as unknown as { files: unknown[]; preferences: Record<string, unknown> }
        expect(migrated.files).toEqual([])
        expect(migrated.preferences.sorting).toEqual(defaultPreferences.sorting)
    })
})

describe("migrateCcStateRecordToV12 (Slice 10c sort-merge transform)", () => {
    const v11ShapeState = () => ({
        preferences: {
            isPresentationMode: true,
            maxTreeMapFiles: 42,
            sortingOption: "NUMBER_OF_FILES",
            sortingOrderAscending: false
        }
    })

    it("should nest the two flat sort prefs into a single preferences.sorting object", () => {
        const migrated = migrateCcStateRecordToV12(v11ShapeState()) as unknown as { preferences: Record<string, unknown> }

        expect(migrated.preferences.sorting).toEqual({ option: "NUMBER_OF_FILES", orderAscending: false })
    })

    it("should delete the two flat sort pref keys and keep the other preferences", () => {
        const migrated = migrateCcStateRecordToV12(v11ShapeState()) as unknown as { preferences: Record<string, unknown> }

        expect("sortingOption" in migrated.preferences).toBe(false)
        expect("sortingOrderAscending" in migrated.preferences).toBe(false)
        expect(migrated.preferences.maxTreeMapFiles).toBe(42)
    })

    it("should fall back to the sorting defaults when the flat keys are absent", () => {
        const migrated = migrateCcStateRecordToV12({ preferences: { maxTreeMapFiles: 42 } }) as unknown as {
            preferences: Record<string, unknown>
        }

        expect(migrated.preferences.sorting).toEqual(defaultPreferences.sorting)
    })

    it("should return the record untouched when it is null or has no preferences", () => {
        expect(migrateCcStateRecordToV12(null)).toBeNull()
        const migrated = migrateCcStateRecordToV12({ files: [] }) as unknown as { files: unknown[]; preferences?: unknown }
        expect(migrated.files).toEqual([])
        expect(migrated.preferences).toBeUndefined()
    })
})

describe("migrateCcStateRecordToV14 (Slice 14e-1 re-home transform)", () => {
    it("should move the interaction ids out of mapState into sharedView, nulled", () => {
        const migrated = migrateCcStateRecordToV14({
            mapState: { hoveredNodeId: 7, selectedBuildingId: 3, rightClickedNodeData: { nodeId: 9 }, scaling: 1 },
            sharedView: { blacklist: [] }
        }) as unknown as { mapState: Record<string, unknown>; sharedView: Record<string, unknown> }

        expect(migrated.sharedView.hoveredNodeId).toBeNull()
        expect(migrated.sharedView.selectedBuildingId).toBeNull()
        expect(migrated.sharedView.rightClickedNodeData).toBeNull()
        expect("hoveredNodeId" in migrated.mapState).toBe(false)
        expect("selectedBuildingId" in migrated.mapState).toBe(false)
        expect("rightClickedNodeData" in migrated.mapState).toBe(false)
        expect(migrated.mapState.scaling).toBe(1)
        expect(migrated.sharedView.blacklist).toEqual([])
    })

    it("should return the record untouched when it is null", () => {
        expect(migrateCcStateRecordToV14(null)).toBeNull()
    })
})

describe("migrateCcStateRecordToV15 (Slice 15e fileSettings-drop transform)", () => {
    const v14ShapeState = () => ({
        fileSettings: { edges: [{ fromNodeName: "/root/a", toNodeName: "/root/b", attributes: {} }] },
        sharedView: { blacklist: [], hoveredNodeId: null, selectedBuildingId: null, rightClickedNodeData: null },
        mapState: { scaling: 1 }
    })

    it("should drop the whole fileSettings root now that edges is a derived dependency-lens selector", () => {
        // Arrange
        const oldShapeState = v14ShapeState()

        // Act
        const migrated = migrateCcStateRecordToV15(oldShapeState) as unknown as { fileSettings?: Record<string, unknown> }

        // Assert
        expect(migrated.fileSettings).toBeUndefined()
    })

    it("should leave every other root untouched", () => {
        // Arrange
        const oldShapeState = v14ShapeState()

        // Act
        const migrated = migrateCcStateRecordToV15(oldShapeState) as unknown as {
            sharedView: Record<string, unknown>
            mapState: Record<string, unknown>
        }

        // Assert
        expect(migrated.sharedView).toEqual({ blacklist: [], hoveredNodeId: null, selectedBuildingId: null, rightClickedNodeData: null })
        expect(migrated.mapState).toEqual({ scaling: 1 })
    })

    it("should return the record untouched when it is null or already has no fileSettings", () => {
        // Arrange / Act / Assert
        expect(migrateCcStateRecordToV15(null)).toBeNull()
        const migrated = migrateCcStateRecordToV15({ files: [] }) as unknown as { files: unknown[]; fileSettings?: unknown }
        expect(migrated.files).toEqual([])
        expect(migrated.fileSettings).toBeUndefined()
    })
})
