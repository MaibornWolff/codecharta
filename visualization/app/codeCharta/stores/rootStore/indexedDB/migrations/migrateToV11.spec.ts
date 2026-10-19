import { defaultPreferences } from "../../../preferences/preferences.read.facade"
import { migrateCcStateRecordToV11 } from "./migrateToV11"

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
