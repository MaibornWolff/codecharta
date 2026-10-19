import { defaultDependencyGraphSettings } from "../../../preferences/preferences.read.facade"
import { migrateCcStateRecordToV30 } from "./migrateToV30"

describe("migrateCcStateRecordToV30 (dependency graph settings without the declaration looks, with the hierarchy)", () => {
    it("should drop the settings the graph lost, seed the hierarchy and keep the ones the reader had set", () => {
        // Arrange
        const keptBefore = { edgeStyle: "straight", isAnchoredAtSideMiddle: true }
        const persistedBefore = { ...keptBefore, declarationArrangement: "chips", declarationKindMark: "tint" }
        const oldShapeState = { preferences: { centerMapZoom: 165, dependencyGraph: persistedBefore } }

        // Act
        const migrated = migrateCcStateRecordToV30(oldShapeState) as unknown as { preferences: Record<string, unknown> }

        // Assert
        expect(migrated.preferences["centerMapZoom"]).toBe(165)
        expect(migrated.preferences["dependencyGraph"]).toEqual({ ...defaultDependencyGraphSettings, ...keptBefore, hierarchy: "folders" })
    })

    it("should pass a blob without the settings, or a nullish one, through unchanged", () => {
        // Arrange
        const withoutSettings = { preferences: { centerMapZoom: 165 } }

        // Act
        const migrated = migrateCcStateRecordToV30(withoutSettings)

        // Assert
        expect(migrated).toBe(withoutSettings)
        expect(migrateCcStateRecordToV30(null)).toBeNull()
    })
})
