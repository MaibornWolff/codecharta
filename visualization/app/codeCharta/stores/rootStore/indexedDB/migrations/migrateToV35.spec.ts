import { defaultDependencyGraphSettings } from "../../../preferences/preferences.read.facade"
import { migrateCcStateRecordToV35 } from "./migrateToV35"

describe("migrateCcStateRecordToV35 (the hover highlight switched off)", () => {
    it("should keep highlighting the box under the pointer for settings saved before it could be switched off, and keep the rest", () => {
        // Arrange
        const { isHoverHighlighted: _notSavedYet, ...savedBefore } = { ...defaultDependencyGraphSettings, edgeStyle: "aside" }
        const oldShapeState = { preferences: { dependencyGraph: savedBefore } }

        // Act
        const migrated = migrateCcStateRecordToV35(oldShapeState) as unknown as { preferences: { dependencyGraph: object } }

        // Assert
        expect(migrated.preferences.dependencyGraph).toEqual({ ...savedBefore, isHoverHighlighted: true })
    })

    it("should leave settings that say it already, and a state without any, as they are", () => {
        // Arrange
        const saidAlready = { preferences: { dependencyGraph: { ...defaultDependencyGraphSettings, isHoverHighlighted: false } } }
        const withoutSettings = { preferences: {} }

        // Act
        const migrated = [saidAlready, withoutSettings, null].map(state => migrateCcStateRecordToV35(state))

        // Assert
        expect(migrated).toEqual([saidAlready, withoutSettings, null])
    })
})
