import { migrateCcStateRecordToV17 } from "./migrateToV17"

describe("migrateCcStateRecordToV17 (domain lens source seed transform)", () => {
    it("should seed an empty domainLensSource root when the blob predates the domain lens", () => {
        // Arrange
        const oldShapeState = { metricsLensSource: { attributeTypes: {}, attributeDescriptors: {} } }

        // Act
        const migrated = migrateCcStateRecordToV17(oldShapeState) as unknown as { domainLensSource: unknown }

        // Assert
        expect(migrated.domainLensSource).toEqual({ words: {} })
    })

    it("should leave an existing domainLensSource untouched", () => {
        // Arrange
        const words = { "/root": [{ text: "invoice", frequency: 3 }] }
        const alreadyMigrated = { domainLensSource: { words } }

        // Act
        const migrated = migrateCcStateRecordToV17(alreadyMigrated) as unknown as { domainLensSource: { words: unknown } }

        // Assert
        expect(migrated.domainLensSource.words).toBe(words)
    })

    it("should pass a nullish blob through unchanged", () => {
        // Arrange & Act & Assert
        expect(migrateCcStateRecordToV17(null)).toBeNull()
    })
})
