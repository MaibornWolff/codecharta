import { defaultDependencyGraphSettings } from "../../../preferences/preferences.read.facade"
import { migrateCcStateRecordToV27 } from "./migrateToV27"

describe("migrateCcStateRecordToV27 (shown edge types saved as an object with numeric keys)", () => {
    it("should turn the shown edge types back into a list", () => {
        // Arrange
        const brokenState = {
            preferences: {
                dependencyGraph: { ...defaultDependencyGraphSettings, shownEdgeTypes: { 0: "cyclic", 1: "cyclic", 2: "regular" } }
            }
        }

        // Act
        const migrated = migrateCcStateRecordToV27(brokenState) as unknown as { preferences: { dependencyGraph: Record<string, unknown> } }

        // Assert
        expect(migrated.preferences.dependencyGraph).toEqual({ ...defaultDependencyGraphSettings, shownEdgeTypes: ["cyclic", "regular"] })
    })

    it("should pass a list of shown edge types, a blob without them, or a nullish one through unchanged", () => {
        // Arrange
        const intact = { preferences: { dependencyGraph: defaultDependencyGraphSettings } }
        const withoutPreferences = { domainState: { topN: 25 } }

        // Act
        const migrated = [intact, withoutPreferences].map(state => migrateCcStateRecordToV27(state))

        // Assert
        expect(migrated).toEqual([intact, withoutPreferences])
        expect(migrated[0]).toBe(intact)
        expect(migrated[1]).toBe(withoutPreferences)
        expect(migrateCcStateRecordToV27(null)).toBeNull()
    })
})
