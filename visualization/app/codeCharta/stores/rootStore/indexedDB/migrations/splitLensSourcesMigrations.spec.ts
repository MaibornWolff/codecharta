import { AttributeTypeValue } from "../../../../model/codeCharta.model"
import { defaultDependencyLensSource } from "../../../dependencyLensSource/dependencyLensSource.read.facade"
import { migrateCcStateRecordToV13, migrateCcStateRecordToV16 } from "./splitLensSourcesMigrations"

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

describe("migrateCcStateRecordToV16 (Slice 20 attributeTypes-unwrap transform)", () => {
    const v15ShapeState = () => ({
        metricsLensSource: {
            attributeTypes: { nodes: { rloc: AttributeTypeValue.absolute }, edges: {} },
            attributeDescriptors: { rloc: { title: "Lines of Code" } }
        },
        dependencyLensSource: {
            attributeTypes: { nodes: {}, edges: { pairing_rate: AttributeTypeValue.relative } }
        },
        mapState: { scaling: 1 }
    })

    it("should unwrap the metrics lens source's attributeTypes to the node half it owns", () => {
        // Arrange
        const oldShapeState = v15ShapeState()

        // Act
        const migrated = migrateCcStateRecordToV16(oldShapeState) as unknown as { metricsLensSource: Record<string, unknown> }

        // Assert
        expect(migrated.metricsLensSource.attributeTypes).toEqual({ rloc: AttributeTypeValue.absolute })
        expect(migrated.metricsLensSource.attributeDescriptors).toEqual({ rloc: { title: "Lines of Code" } })
    })

    it("should unwrap the dependency lens source's attributeTypes to the edge half it owns", () => {
        // Arrange
        const oldShapeState = v15ShapeState()

        // Act
        const migrated = migrateCcStateRecordToV16(oldShapeState) as unknown as { dependencyLensSource: Record<string, unknown> }

        // Assert
        expect(migrated.dependencyLensSource.attributeTypes).toEqual({ pairing_rate: AttributeTypeValue.relative })
    })

    it("should fall back to an empty map when the owned half is missing", () => {
        // Arrange
        const oldShapeState = {
            metricsLensSource: { attributeTypes: { edges: {} } },
            dependencyLensSource: { attributeTypes: { nodes: {} } }
        }

        // Act
        const migrated = migrateCcStateRecordToV16(oldShapeState) as unknown as {
            metricsLensSource: Record<string, unknown>
            dependencyLensSource: Record<string, unknown>
        }

        // Assert
        expect(migrated.metricsLensSource.attributeTypes).toEqual({})
        expect(migrated.dependencyLensSource.attributeTypes).toEqual({})
    })

    it("should leave an already flat attributeTypes map untouched", () => {
        // Arrange
        const alreadyFlatState = {
            metricsLensSource: { attributeTypes: { rloc: AttributeTypeValue.absolute } },
            dependencyLensSource: { attributeTypes: { pairing_rate: AttributeTypeValue.relative } }
        }

        // Act
        const migrated = migrateCcStateRecordToV16(alreadyFlatState) as unknown as {
            metricsLensSource: Record<string, unknown>
            dependencyLensSource: Record<string, unknown>
        }

        // Assert
        expect(migrated.metricsLensSource.attributeTypes).toEqual({ rloc: AttributeTypeValue.absolute })
        expect(migrated.dependencyLensSource.attributeTypes).toEqual({ pairing_rate: AttributeTypeValue.relative })
    })

    it("should leave every other root untouched", () => {
        // Arrange
        const oldShapeState = v15ShapeState()

        // Act
        const migrated = migrateCcStateRecordToV16(oldShapeState) as unknown as { mapState: Record<string, unknown> }

        // Assert
        expect(migrated.mapState).toEqual({ scaling: 1 })
    })

    it("should return the record untouched when it is null or has no lens source roots", () => {
        // Arrange / Act / Assert
        expect(migrateCcStateRecordToV16(null)).toBeNull()
        const migrated = migrateCcStateRecordToV16({ files: [] }) as unknown as {
            files: unknown[]
            metricsLensSource?: unknown
            dependencyLensSource?: unknown
        }
        expect(migrated.files).toEqual([])
        expect(migrated.metricsLensSource).toBeUndefined()
        expect(migrated.dependencyLensSource).toBeUndefined()
    })
})
