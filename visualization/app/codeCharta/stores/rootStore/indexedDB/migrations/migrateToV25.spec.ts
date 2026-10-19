import { migrateCcStateRecordToV25 } from "./migrateToV25"

describe("migrateCcStateRecordToV25 (radial level count seed on the persisted preferences)", () => {
    it("should seed the default level count on preferences persisted before it", () => {
        // Arrange
        const oldShapeState = { preferences: { centerMapZoom: 165 } }

        // Act
        const migrated = migrateCcStateRecordToV25(oldShapeState) as unknown as { preferences: Record<string, unknown> }

        // Assert
        expect(migrated.preferences).toEqual({ centerMapZoom: 165, radialLevels: 3 })
    })

    it("should leave an existing level count untouched", () => {
        // Arrange
        const alreadyMigrated = { preferences: { radialLevels: 7 } }

        // Act
        const migrated = migrateCcStateRecordToV25(alreadyMigrated)

        // Assert
        expect(migrated).toBe(alreadyMigrated)
    })

    it("should pass a blob without preferences through unchanged", () => {
        // Arrange
        const withoutPreferences = { domainState: { topN: 25 } }

        // Act
        const migrated = migrateCcStateRecordToV25(withoutPreferences)

        // Assert
        expect(migrated).toBe(withoutPreferences)
    })

    it("should pass a nullish blob through unchanged", () => {
        // Arrange & Act & Assert
        expect(migrateCcStateRecordToV25(null)).toBeNull()
    })
})
