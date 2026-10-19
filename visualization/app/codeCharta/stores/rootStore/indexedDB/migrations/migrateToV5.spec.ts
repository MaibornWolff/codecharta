import { defaultMapState } from "../../../mapState/mapState.read.facade"
import { migrateCcStateRecordToV5 } from "./migrateToV5"

describe("migrateCcStateRecordToV5 (Slice 7 re-home transform)", () => {
    const v4ShapeState = () => ({
        dynamicSettings: {
            areaMetric: "rloc",
            heightMetric: "mcc",
            colorMetric: "cov",
            edgeMetric: "pairingRate",
            distributionMetric: "rloc",
            sortingOption: "NAME",
            focusedNodePath: [],
            searchPattern: ""
        }
    })

    it("should move the five metric-selection keys from dynamicSettings into mapState", () => {
        const migrated = migrateCcStateRecordToV5(v4ShapeState()) as unknown as { mapState: Record<string, unknown> }

        expect(migrated.mapState.areaMetric).toBe("rloc")
        expect(migrated.mapState.heightMetric).toBe("mcc")
        expect(migrated.mapState.colorMetric).toBe("cov")
        expect(migrated.mapState.edgeMetric).toBe("pairingRate")
        expect(migrated.mapState.distributionMetric).toBe("rloc")
    })

    it("should drop the moved metrics from dynamicSettings and keep the staying ones", () => {
        const migrated = migrateCcStateRecordToV5(v4ShapeState()) as unknown as { dynamicSettings: Record<string, unknown> }

        expect("areaMetric" in migrated.dynamicSettings).toBe(false)
        expect("distributionMetric" in migrated.dynamicSettings).toBe(false)
        expect(migrated.dynamicSettings.sortingOption).toBe("NAME")
        expect(migrated.dynamicSettings.searchPattern).toBe("")
        expect(migrated.dynamicSettings.focusedNodePath).toEqual([])
    })

    it("should fill mapState metric keys absent from the old blob with their defaults", () => {
        const migrated = migrateCcStateRecordToV5({ dynamicSettings: {} }) as unknown as { mapState: Record<string, unknown> }

        expect(migrated.mapState.areaMetric).toBe(defaultMapState.areaMetric)
        expect(migrated.mapState.colorMetric).toBe(defaultMapState.colorMetric)
    })

    it("should return the record untouched when it is null or has no dynamicSettings", () => {
        expect(migrateCcStateRecordToV5(null)).toBeNull()
        const migrated = migrateCcStateRecordToV5({ files: [] }) as unknown as { files: unknown[]; mapState: Record<string, unknown> }
        expect(migrated.files).toEqual([])
        expect(migrated.mapState.areaMetric).toBe(defaultMapState.areaMetric)
    })
})
