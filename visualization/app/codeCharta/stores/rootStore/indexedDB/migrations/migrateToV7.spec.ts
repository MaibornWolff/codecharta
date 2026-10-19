import { AttributeTypeValue } from "../../../../model/codeCharta.model"
import { defaultMetricsLensSource } from "../../../metricsLensSource/metricsLensSource.read.facade"
import { migrateCcStateRecordToV7 } from "./migrateToV7"

describe("migrateCcStateRecordToV7 (Slice 9a re-home transform)", () => {
    const v6ShapeState = () => ({
        fileSettings: {
            blacklist: [],
            edges: [],
            markedPackages: [],
            attributeTypes: { nodes: { rloc: AttributeTypeValue.absolute }, edges: {} },
            attributeDescriptors: { rloc: { title: "Lines of Code" } }
        }
    })

    it("should move attributeTypes + attributeDescriptors from fileSettings into a brand-new metricsLensSource root", () => {
        const migrated = migrateCcStateRecordToV7(v6ShapeState()) as unknown as { metricsLensSource: Record<string, unknown> }

        expect(migrated.metricsLensSource.attributeTypes).toEqual({ nodes: { rloc: AttributeTypeValue.absolute }, edges: {} })
        expect(migrated.metricsLensSource.attributeDescriptors).toEqual({ rloc: { title: "Lines of Code" } })
    })

    it("should drop the moved keys from fileSettings and keep the staying ones", () => {
        const migrated = migrateCcStateRecordToV7(v6ShapeState()) as unknown as { fileSettings: Record<string, unknown> }

        expect("attributeTypes" in migrated.fileSettings).toBe(false)
        expect("attributeDescriptors" in migrated.fileSettings).toBe(false)
        expect(migrated.fileSettings.blacklist).toEqual([])
        expect(migrated.fileSettings.edges).toEqual([])
        expect(migrated.fileSettings.markedPackages).toEqual([])
    })

    it("should fill metricsLensSource keys absent from the old blob with their defaults", () => {
        const migrated = migrateCcStateRecordToV7({ fileSettings: {} }) as unknown as { metricsLensSource: Record<string, unknown> }

        expect(migrated.metricsLensSource.attributeTypes).toEqual(defaultMetricsLensSource.attributeTypes)
        expect(migrated.metricsLensSource.attributeDescriptors).toEqual(defaultMetricsLensSource.attributeDescriptors)
    })

    it("should return the record untouched when it is null, and build a default metricsLensSource when there is no fileSettings", () => {
        expect(migrateCcStateRecordToV7(null)).toBeNull()
        const migrated = migrateCcStateRecordToV7({ files: [] }) as unknown as {
            files: unknown[]
            metricsLensSource: Record<string, unknown>
        }
        expect(migrated.files).toEqual([])
        expect(migrated.metricsLensSource.attributeTypes).toEqual(defaultMetricsLensSource.attributeTypes)
    })
})
