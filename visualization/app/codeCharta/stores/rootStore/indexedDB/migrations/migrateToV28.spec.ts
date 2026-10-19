import { migrateCcStateRecordToV28 } from "./migrateToV28"

describe("migrateCcStateRecordToV28 (dependency view setting seed on the persisted preferences)", () => {
    it("should seed the dependency view as switched off on preferences persisted before the setting", () => {
        // Arrange
        const oldShapeState = { preferences: { centerMapZoom: 165 } }

        // Act
        const migrated = migrateCcStateRecordToV28(oldShapeState) as unknown as { preferences: Record<string, unknown> }

        // Assert
        expect(migrated.preferences).toEqual({ centerMapZoom: 165, dependencyViewEnabled: false })
    })

    it("should pass a saved setting, a blob without preferences, or a nullish one through unchanged", () => {
        // Arrange
        const alreadyMigrated = { preferences: { dependencyViewEnabled: true } }
        const withoutPreferences = { domainState: { topN: 25 } }

        // Act
        const migrated = [alreadyMigrated, withoutPreferences].map(state => migrateCcStateRecordToV28(state))

        // Assert
        expect(migrated[0]).toBe(alreadyMigrated)
        expect(migrated[1]).toBe(withoutPreferences)
        expect(migrateCcStateRecordToV28(null)).toBeNull()
    })
})
