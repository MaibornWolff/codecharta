import { defaultDependencyGraphSettings } from "../../../preferences/preferences.read.facade"
import { migrateCcStateRecordToV29 } from "./migrateToV29"

describe("migrateCcStateRecordToV29 (declaration settings seed on the persisted dependency graph settings)", () => {
    it("should seed the settings the graph gained with their defaults and keep the ones the reader had set", () => {
        // Arrange
        const persistedBefore = { shownEdgeTypes: ["cyclic"], edgeStyle: "straight", levelLabel: "path" }
        const oldShapeState = { preferences: { centerMapZoom: 165, dependencyGraph: persistedBefore } }

        // Act
        const migrated = migrateCcStateRecordToV29(oldShapeState) as unknown as { preferences: Record<string, unknown> }

        // Assert
        expect(migrated.preferences["centerMapZoom"]).toBe(165)
        expect(migrated.preferences["dependencyGraph"]).toEqual({ ...defaultDependencyGraphSettings, ...persistedBefore })
        expect(migrated.preferences["dependencyGraph"]).toMatchObject({
            lineStyleShows: "edgeType",
            hierarchy: "folders"
        })
    })

    it("should pass complete settings, a blob without them, or a nullish one through unchanged", () => {
        // Arrange
        const alreadyMigrated = { preferences: { dependencyGraph: { ...defaultDependencyGraphSettings, edgeStyle: "straight" } } }
        const withoutSettings = { preferences: { centerMapZoom: 165 } }

        // Act
        const migrated = [alreadyMigrated, withoutSettings].map(state => migrateCcStateRecordToV29(state))

        // Assert
        expect(migrated[0]).toBe(alreadyMigrated)
        expect(migrated[1]).toBe(withoutSettings)
        expect(migrateCcStateRecordToV29(null)).toBeNull()
    })
})
