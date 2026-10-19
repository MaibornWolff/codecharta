import { migrateCcStateRecordToV34 } from "./migrateToV34"

describe("migrateCcStateRecordToV34 (the dependency view is no longer switched on)", () => {
    it.each([true, false])("should drop the dependency view setting saved as %s and keep the other preferences", isEnabled => {
        // Arrange
        const oldShapeState = { preferences: { centerMapZoom: 165, dependencyViewEnabled: isEnabled } }

        // Act
        const migrated = migrateCcStateRecordToV34(oldShapeState) as unknown as { preferences: Record<string, unknown> }

        // Assert
        expect(migrated.preferences).toEqual({ centerMapZoom: 165 })
    })

    it("should leave preferences without the setting, a state without preferences, and a nullish one as they are", () => {
        // Arrange
        const ofToday = { preferences: { centerMapZoom: 165 } }
        const withoutPreferences = { domainState: { topN: 25 } }

        // Act
        const migrated = [ofToday, withoutPreferences, null].map(state => migrateCcStateRecordToV34(state))

        // Assert
        expect(migrated[0]).toBe(ofToday)
        expect(migrated[1]).toBe(withoutPreferences)
        expect(migrated[2]).toBeNull()
    })
})
