import { migrateCcStateRecordToV20 } from "./migrateToV20"

describe("migrateCcStateRecordToV20 (metric rules seed on the persisted shared view)", () => {
    it("should seed empty metric rules on a shared view persisted before metric rules", () => {
        // Arrange
        const oldShapeState = { sharedView: { searchPattern: "needle", blacklist: [] } }

        // Act
        const migrated = migrateCcStateRecordToV20(oldShapeState) as unknown as {
            sharedView: { searchPattern: string; metricRules: unknown }
        }

        // Assert
        expect(migrated.sharedView.metricRules).toEqual([])
        expect(migrated.sharedView.searchPattern).toBe("needle")
    })

    it("should leave existing metric rules untouched", () => {
        // Arrange
        const metricRules = [{ id: "rule", metric: "rloc", operator: ">", threshold: 100, action: "exclude" }]
        const alreadyMigrated = { sharedView: { metricRules } }

        // Act
        const migrated = migrateCcStateRecordToV20(alreadyMigrated) as unknown as { sharedView: { metricRules: unknown } }

        // Assert
        expect(migrated.sharedView.metricRules).toBe(metricRules)
    })

    it("should pass a blob without a shared view through unchanged", () => {
        // Arrange
        const withoutSharedView = { domainState: { topN: 25 } }

        // Act
        const migrated = migrateCcStateRecordToV20(withoutSharedView)

        // Assert
        expect(migrated).toBe(withoutSharedView)
    })

    it("should pass a nullish blob through unchanged", () => {
        // Arrange & Act & Assert
        expect(migrateCcStateRecordToV20(null)).toBeNull()
    })
})
