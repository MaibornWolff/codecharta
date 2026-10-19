import { migrateCcStateRecordToV24 } from "./migrateToV24"

describe("migrateCcStateRecordToV24 (radial folder colouring seed on the persisted preferences)", () => {
    it("should seed the default folder colouring on preferences persisted before it", () => {
        // Arrange
        const oldShapeState = { preferences: { centerMapZoom: 165 } }

        // Act
        const migrated = migrateCcStateRecordToV24(oldShapeState) as unknown as { preferences: Record<string, unknown> }

        // Assert
        expect(migrated.preferences).toEqual({
            centerMapZoom: 165,
            radialFolderValue: "max",
            radialFolderStyle: "tinted",
            radialFolderTint: 0.5
        })
    })

    it("should leave an existing folder colouring untouched", () => {
        // Arrange
        const alreadyMigrated = { preferences: { radialFolderValue: "median", radialFolderStyle: "neutral", radialFolderTint: 0.8 } }

        // Act
        const migrated = migrateCcStateRecordToV24(alreadyMigrated)

        // Assert
        expect(migrated).toBe(alreadyMigrated)
    })

    it("should pass a blob without preferences through unchanged", () => {
        // Arrange
        const withoutPreferences = { domainState: { topN: 25 } }

        // Act
        const migrated = migrateCcStateRecordToV24(withoutPreferences)

        // Assert
        expect(migrated).toBe(withoutPreferences)
    })

    it("should pass a nullish blob through unchanged", () => {
        // Arrange & Act & Assert
        expect(migrateCcStateRecordToV24(null)).toBeNull()
    })
})
