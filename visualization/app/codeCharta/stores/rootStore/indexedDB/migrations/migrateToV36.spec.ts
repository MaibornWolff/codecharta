import { migrateCcStateRecordToV36 } from "./migrateToV36"

describe("migrateCcStateRecordToV36 (the switch for local source files)", () => {
    it("should keep local source files closed for preferences saved before they could be opened, and keep the rest", () => {
        // Arrange
        const oldShapeState = { preferences: { radialLevels: 4 } }

        // Act
        const migrated = migrateCcStateRecordToV36(oldShapeState)

        // Assert
        expect(migrated).toEqual({ preferences: { radialLevels: 4, localSourceEnabled: false } })
    })

    it("should leave preferences that say it already, and states without any, as they are", () => {
        // Arrange
        const saidAlready = { preferences: { localSourceEnabled: true } }
        const withoutPreferences = { mapState: {} }

        // Act
        const migrated = [saidAlready, withoutPreferences, null].map(state => migrateCcStateRecordToV36(state))

        // Assert
        expect(migrated).toEqual([saidAlready, withoutPreferences, null])
    })
})
