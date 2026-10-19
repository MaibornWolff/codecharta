import { migrateCcStateRecordToV21 } from "./migrateToV21"

describe("migrateCcStateRecordToV21 (center map zoom seed on the persisted preferences)", () => {
    it("should seed the default center map zoom on preferences persisted before it", () => {
        // Arrange
        const oldShapeState = { preferences: { maxTreeMapFiles: 100 } }

        // Act
        const migrated = migrateCcStateRecordToV21(oldShapeState) as unknown as {
            preferences: { maxTreeMapFiles: number; centerMapZoom: number }
        }

        // Assert
        expect(migrated.preferences.centerMapZoom).toBe(140)
        expect(migrated.preferences.maxTreeMapFiles).toBe(100)
    })

    it("should leave an existing center map zoom untouched", () => {
        // Arrange
        const alreadyMigrated = { preferences: { centerMapZoom: 165 } }

        // Act
        const migrated = migrateCcStateRecordToV21(alreadyMigrated) as unknown as { preferences: { centerMapZoom: number } }

        // Assert
        expect(migrated.preferences.centerMapZoom).toBe(165)
    })

    it("should pass a blob without preferences through unchanged", () => {
        // Arrange
        const withoutPreferences = { domainState: { topN: 25 } }

        // Act
        const migrated = migrateCcStateRecordToV21(withoutPreferences)

        // Assert
        expect(migrated).toBe(withoutPreferences)
    })

    it("should pass a nullish blob through unchanged", () => {
        // Arrange & Act & Assert
        expect(migrateCcStateRecordToV21(null)).toBeNull()
    })
})
