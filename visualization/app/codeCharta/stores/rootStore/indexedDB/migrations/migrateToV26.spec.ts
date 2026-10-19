import { defaultDependencyGraphSettings } from "../../../preferences/preferences.read.facade"
import { migrateCcStateRecordToV26 } from "./migrateToV26"

describe("migrateCcStateRecordToV26 (dependency bar settings seed on the persisted preferences)", () => {
    it("should seed the default dependency bar settings on preferences persisted before them", () => {
        // Arrange
        const oldShapeState = { preferences: { centerMapZoom: 165 } }

        // Act
        const migrated = migrateCcStateRecordToV26(oldShapeState) as unknown as { preferences: Record<string, unknown> }

        // Assert
        expect(migrated.preferences).toEqual({ centerMapZoom: 165, dependencyGraph: defaultDependencyGraphSettings })
    })

    it("should leave existing dependency bar settings untouched", () => {
        // Arrange
        const alreadyMigrated = { preferences: { dependencyGraph: { ...defaultDependencyGraphSettings, edgeStyle: "straight" } } }

        // Act
        const migrated = migrateCcStateRecordToV26(alreadyMigrated)

        // Assert
        expect(migrated).toBe(alreadyMigrated)
    })

    it("should pass a blob without preferences, or a nullish one, through unchanged", () => {
        // Arrange
        const withoutPreferences = { domainState: { topN: 25 } }

        // Act
        const migrated = migrateCcStateRecordToV26(withoutPreferences)

        // Assert
        expect(migrated).toBe(withoutPreferences)
        expect(migrateCcStateRecordToV26(null)).toBeNull()
    })
})
