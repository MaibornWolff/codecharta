import { defaultMapState } from "../../../mapState/mapState.read.facade"
import { defaultPreferences } from "../../../preferences/preferences.read.facade"
import { migrateCcStateRecordToV3 } from "./migrateToV3"

describe("migrateCcStateRecordToV3 (Slice 5 re-home transform)", () => {
    it("should move the map-view keys from appSettings into a new mapState root", () => {
        const oldShapeState = {
            appSettings: {
                ...defaultPreferences,
                invertHeight: true,
                amountOfTopLabels: 7,
                mapColors: { ...defaultMapState.mapColors, positive: "#123456" }
            }
        }

        const migrated = migrateCcStateRecordToV3(oldShapeState) as unknown as {
            appSettings: Record<string, unknown>
            mapState: Record<string, unknown>
        }

        expect(migrated.mapState.invertHeight).toBe(true)
        expect(migrated.mapState.amountOfTopLabels).toBe(7)
        expect((migrated.mapState.mapColors as { positive: string }).positive).toBe("#123456")
    })

    it("should keep the settings that stay under appSettings and drop the moved ones", () => {
        const oldShapeState = { appSettings: { ...defaultPreferences, invertHeight: true, amountOfTopLabels: 7 } }

        const migrated = migrateCcStateRecordToV3(oldShapeState) as { appSettings: Record<string, unknown> }

        expect(migrated.appSettings.maxTreeMapFiles).toBe(defaultPreferences.maxTreeMapFiles)
        expect("invertHeight" in migrated.appSettings).toBe(false)
        expect("amountOfTopLabels" in migrated.appSettings).toBe(false)
    })

    it("should fill map-view keys absent from the old blob with their defaults", () => {
        const migrated = migrateCcStateRecordToV3({ appSettings: { ...defaultPreferences } }) as unknown as {
            mapState: Record<string, unknown>
        }

        expect(migrated.mapState.labelSize).toBe(defaultMapState.labelSize)
        expect(migrated.mapState.scaling).toEqual(defaultMapState.scaling)
    })

    it("should return the record untouched when it has no appSettings", () => {
        expect(migrateCcStateRecordToV3(null)).toBeNull()
        expect(migrateCcStateRecordToV3({ files: [] })).toEqual({ files: [] })
    })
})
