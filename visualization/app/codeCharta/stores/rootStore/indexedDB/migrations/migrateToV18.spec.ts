import { migrateCcStateRecordToV18 } from "./migrateToV18"

describe("migrateCcStateRecordToV18 (domainState seed transform)", () => {
    it("should seed the default domainState root when the blob predates the domain settings", () => {
        // Arrange
        const oldShapeState = { metricsLensSource: { attributeTypes: {}, attributeDescriptors: {} } }

        // Act
        const migrated = migrateCcStateRecordToV18(oldShapeState) as unknown as { domainState: { topN: number } }

        // Assert
        expect(migrated.domainState.topN).toBe(150)
    })

    it("should leave an existing domainState untouched", () => {
        // Arrange
        const domainState = { topN: 25 }
        const alreadyMigrated = { domainState }

        // Act
        const migrated = migrateCcStateRecordToV18(alreadyMigrated) as unknown as { domainState: unknown }

        // Assert
        expect(migrated.domainState).toBe(domainState)
    })

    it("should pass a nullish blob through unchanged", () => {
        // Arrange & Act & Assert
        expect(migrateCcStateRecordToV18(null)).toBeNull()
    })
})
