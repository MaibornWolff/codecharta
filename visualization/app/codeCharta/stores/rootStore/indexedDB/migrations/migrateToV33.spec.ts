import { defaultDependencyGraphSettings } from "../../../preferences/preferences.read.facade"
import { migrateCcStateRecordToV32 } from "./migrateToV32"
import { migrateCcStateRecordToV33 } from "./migrateToV33"

describe("migrateCcStateRecordToV33 (levels by number only, each box badge on its own)", () => {
    it.each([
        [true, ["betweenFiles", "insideFiles", "declaration", "upward"]],
        [false, ["upward"]]
    ])("should drop the level label and, for cycle badges shown %s, show the badges %j", (showsCycleBadges, shownBoxBadges) => {
        // Arrange
        const { shownBoxBadges: _notSavedYet, ...savedBefore } = { ...defaultDependencyGraphSettings, edgeStyle: "aside" }
        const oldShapeState = {
            preferences: { centerMapZoom: 165, dependencyGraph: { ...savedBefore, levelLabel: "path", showsCycleBadges } }
        }

        // Act
        const migrated = migrateCcStateRecordToV33(oldShapeState) as unknown as { preferences: Record<string, unknown> }

        // Assert
        expect(migrated.preferences).toEqual({ centerMapZoom: 165, dependencyGraph: { ...savedBefore, shownBoxBadges } })
    })

    it("should keep the cycle badges off for settings saved at v31, though v32 seeded every badge before", () => {
        // Arrange
        const {
            shownBoxBadges: _notSavedYet,
            isHoverLimitedToShownEdgeTypes: _notSavedEither,
            ...savedAtV31
        } = defaultDependencyGraphSettings
        const oldShapeState = { preferences: { dependencyGraph: { ...savedAtV31, levelLabel: "number", showsCycleBadges: false } } }

        // Act
        const migrated = migrateCcStateRecordToV33(migrateCcStateRecordToV32(oldShapeState)) as unknown as {
            preferences: { dependencyGraph: object }
        }

        // Assert
        expect(migrated.preferences.dependencyGraph).toEqual({
            ...savedAtV31,
            isHoverLimitedToShownEdgeTypes: false,
            shownBoxBadges: ["upward"]
        })
    })

    it("should leave settings of today, a state without any, and a nullish one as they are", () => {
        // Arrange
        const ofToday = { preferences: { dependencyGraph: { ...defaultDependencyGraphSettings, shownBoxBadges: ["upward"] } } }
        const withoutSettings = { preferences: {} }

        // Act
        const migrated = [ofToday, withoutSettings, null].map(state => migrateCcStateRecordToV33(state))

        // Assert
        expect(migrated).toEqual([ofToday, withoutSettings, null])
        expect(migrated[0]).toBe(ofToday)
    })
})
