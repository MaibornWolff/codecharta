import { defaultDependencyGraphSettings } from "../../../preferences/preferences.read.facade"
import { migrateCcStateRecordToV32 } from "./migrateToV32"

describe("migrateCcStateRecordToV32 (the hover held to the shown edge types)", () => {
    it("should let the hover show every edge for settings saved before it could be held to the shown types, and keep the rest", () => {
        // Arrange
        const { isHoverLimitedToShownEdgeTypes: _notSavedYet, ...savedBefore } = { ...defaultDependencyGraphSettings, edgeStyle: "aside" }
        const oldShapeState = { preferences: { dependencyGraph: savedBefore } }

        // Act
        const migrated = migrateCcStateRecordToV32(oldShapeState) as unknown as { preferences: { dependencyGraph: object } }

        // Assert
        expect(migrated.preferences.dependencyGraph).toEqual({ ...savedBefore, isHoverLimitedToShownEdgeTypes: false })
    })

    it("should leave settings that say it already, and a state without any, as they are", () => {
        // Arrange
        const saidAlready = {
            preferences: { dependencyGraph: { ...defaultDependencyGraphSettings, isHoverLimitedToShownEdgeTypes: true } }
        }
        const withoutSettings = { preferences: {} }

        // Act
        const migrated = [saidAlready, withoutSettings, null].map(state => migrateCcStateRecordToV32(state))

        // Assert
        expect(migrated).toEqual([saidAlready, withoutSettings, null])
    })
})
