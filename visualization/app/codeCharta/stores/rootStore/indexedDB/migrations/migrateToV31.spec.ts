import { defaultDependencyGraphSettings } from "../../../preferences/preferences.read.facade"
import { migrateCcStateRecordToV31 } from "./migrateToV31"

describe("migrateCcStateRecordToV31 (edge styles of the dependency graph without curved and straight)", () => {
    it.each([
        [{ edgeStyle: "curved" }, { edgeStyle: "combined", edgeShape: "curved" }],
        [{ edgeStyle: "spread" }, { edgeStyle: "spread", edgeShape: "curved" }],
        [{ edgeStyle: "upwardAside" }, { edgeStyle: "aside", edgeShape: "curved" }],
        [{ edgeStyle: "straight" }, { edgeStyle: "spread", edgeShape: "straight" }],
        [
            { edgeStyle: "straight", edgeShape: "curved" },
            { edgeStyle: "spread", edgeShape: "straight" }
        ],
        [
            { edgeStyle: "straight", isAnchoredAtSideMiddle: true },
            { edgeStyle: "combined", edgeShape: "straight", isAnchoredAtSideMiddle: true }
        ]
    ])("should draw the edges persisted as %j as %j", (persistedBefore, expected) => {
        // Arrange
        const oldShapeState = { preferences: { centerMapZoom: 165, dependencyGraph: { levelLabel: "path", ...persistedBefore } } }

        // Act
        const migrated = migrateCcStateRecordToV31(oldShapeState) as unknown as { preferences: Record<string, unknown> }

        // Assert
        expect(migrated.preferences).toEqual({ centerMapZoom: 165, dependencyGraph: { levelLabel: "path", ...expected } })
    })

    it("should pass settings of today, a blob without them, or a nullish one through unchanged", () => {
        // Arrange
        const alreadyMigrated = { preferences: { dependencyGraph: { ...defaultDependencyGraphSettings, edgeShape: "straight" } } }
        const withoutSettings = { preferences: { centerMapZoom: 165 } }

        // Act
        const migrated = [alreadyMigrated, withoutSettings].map(state => migrateCcStateRecordToV31(state))

        // Assert
        expect(migrated[0]).toBe(alreadyMigrated)
        expect(migrated[1]).toBe(withoutSettings)
        expect(migrateCcStateRecordToV31(null)).toBeNull()
    })
})
