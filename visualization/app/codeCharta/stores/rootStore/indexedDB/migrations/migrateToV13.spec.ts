import { AttributeTypeValue } from "../../../../model/codeCharta.model"
import { defaultDependencyLensSource } from "../../../dependencyLensSource/dependencyLensSource.read.facade"
import { migrateCcStateRecordToV13 } from "./migrateToV13"

describe("migrateCcStateRecordToV13 (Slice 14 edge-attributeTypes split transform)", () => {
    const v12ShapeState = () => ({
        metricsLensSource: {
            attributeTypes: {
                nodes: { rloc: AttributeTypeValue.absolute },
                edges: { pairing_rate: AttributeTypeValue.relative }
            },
            attributeDescriptors: { rloc: { title: "Lines of Code" } }
        }
    })

    it("should move the edge attributeTypes out of metricsLensSource into a brand-new dependencyLensSource root", () => {
        const migrated = migrateCcStateRecordToV13(v12ShapeState()) as unknown as { dependencyLensSource: Record<string, unknown> }

        expect(migrated.dependencyLensSource.attributeTypes).toEqual({ nodes: {}, edges: { pairing_rate: AttributeTypeValue.relative } })
    })

    it("should keep the node attributeTypes + descriptors in metricsLensSource and empty its edges", () => {
        const migrated = migrateCcStateRecordToV13(v12ShapeState()) as unknown as { metricsLensSource: Record<string, unknown> }

        expect(migrated.metricsLensSource.attributeTypes).toEqual({ nodes: { rloc: AttributeTypeValue.absolute }, edges: {} })
        expect(migrated.metricsLensSource.attributeDescriptors).toEqual({ rloc: { title: "Lines of Code" } })
    })

    it("should fill dependencyLensSource with its default when metricsLensSource is absent", () => {
        const migrated = migrateCcStateRecordToV13({ files: [] }) as unknown as {
            files: unknown[]
            dependencyLensSource: Record<string, unknown>
        }

        expect(migrated.files).toEqual([])
        expect(migrated.dependencyLensSource.attributeTypes).toEqual(defaultDependencyLensSource.attributeTypes)
    })

    it("should return the record untouched when it is null", () => {
        expect(migrateCcStateRecordToV13(null)).toBeNull()
    })
})
