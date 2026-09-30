import {
    migrateCcStateRecordToV17,
    migrateCcStateRecordToV18,
    migrateCcStateRecordToV19,
    migrateCcStateRecordToV20,
    migrateCcStateRecordToV21,
    migrateCcStateRecordToV24,
    migrateCcStateRecordToV25
} from "./seedDefaultsMigrations"

describe("migrateCcStateRecordToV17 (domain lens source seed transform)", () => {
    it("should seed an empty domainLensSource root when the blob predates the domain lens", () => {
        // Arrange
        const oldShapeState = { metricsLensSource: { attributeTypes: {}, attributeDescriptors: {} } }

        // Act
        const migrated = migrateCcStateRecordToV17(oldShapeState) as unknown as { domainLensSource: unknown }

        // Assert
        expect(migrated.domainLensSource).toEqual({ words: {} })
    })

    it("should leave an existing domainLensSource untouched", () => {
        // Arrange
        const words = { "/root": [{ text: "invoice", frequency: 3 }] }
        const alreadyMigrated = { domainLensSource: { words } }

        // Act
        const migrated = migrateCcStateRecordToV17(alreadyMigrated) as unknown as { domainLensSource: { words: unknown } }

        // Assert
        expect(migrated.domainLensSource.words).toBe(words)
    })

    it("should pass a nullish blob through unchanged", () => {
        // Arrange & Act & Assert
        expect(migrateCcStateRecordToV17(null)).toBeNull()
    })
})

describe("migrateCcStateRecordToV18 (domainState seed transform)", () => {
    it("should seed the default domainState root when the blob predates the domain settings", () => {
        // Arrange
        const oldShapeState = { metricsLensSource: { attributeTypes: {}, attributeDescriptors: {} } }

        // Act
        const migrated = migrateCcStateRecordToV18(oldShapeState) as unknown as { domainState: { topN: number } }

        // Assert
        expect(migrated.domainState.topN).toBe(150)
    })

    it("should leave an existing domainState untouched", () => {
        // Arrange
        const domainState = { topN: 25 }
        const alreadyMigrated = { domainState }

        // Act
        const migrated = migrateCcStateRecordToV18(alreadyMigrated) as unknown as { domainState: unknown }

        // Assert
        expect(migrated.domainState).toBe(domainState)
    })

    it("should pass a nullish blob through unchanged", () => {
        // Arrange & Act & Assert
        expect(migrateCcStateRecordToV18(null)).toBeNull()
    })
})

describe("migrateCcStateRecordToV19 (domain words backfill on persisted files)", () => {
    it("should seed empty domain words on a file state persisted before the domain lens", () => {
        // Arrange
        const fileSettings = { attributeTypes: {}, attributeDescriptors: {}, blacklist: [], markedPackages: [] }
        const oldShapeState = { files: [{ selectedAs: "Partial", file: { settings: { fileSettings } } }] }

        // Act
        const migrated = migrateCcStateRecordToV19(oldShapeState) as unknown as {
            files: Array<{ selectedAs: string; file: { settings: { fileSettings: { domainWords: unknown } } } }>
        }

        // Assert
        expect(migrated.files[0].file.settings.fileSettings.domainWords).toEqual({})
        expect(migrated.files[0].selectedAs).toBe("Partial")
    })

    it("should leave existing domain words untouched", () => {
        // Arrange
        const domainWords = { "/root": [{ text: "invoice", frequency: 3 }] }
        const alreadyMigrated = { files: [{ file: { settings: { fileSettings: { domainWords } } } }] }

        // Act
        const migrated = migrateCcStateRecordToV19(alreadyMigrated) as unknown as {
            files: Array<{ file: { settings: { fileSettings: { domainWords: unknown } } } }>
        }

        // Assert
        expect(migrated.files[0].file.settings.fileSettings.domainWords).toBe(domainWords)
    })

    it("should pass a blob without files through unchanged", () => {
        // Arrange
        const withoutFiles = { domainState: { topN: 25 } }

        // Act
        const migrated = migrateCcStateRecordToV19(withoutFiles)

        // Assert
        expect(migrated).toBe(withoutFiles)
    })

    it("should pass a nullish blob through unchanged", () => {
        // Arrange & Act & Assert
        expect(migrateCcStateRecordToV19(null)).toBeNull()
    })
})

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

describe("migrateCcStateRecordToV21 (center map zoom seed on the persisted preferences)", () => {
    it("should seed the default center map zoom on preferences persisted before it", () => {
        // Arrange
        const oldShapeState = { preferences: { maxTreeMapFiles: 100 } }

        // Act
        const migrated = migrateCcStateRecordToV21(oldShapeState) as unknown as {
            preferences: { maxTreeMapFiles: number; centerMapZoom: number }
        }

        // Assert
        expect(migrated.preferences.centerMapZoom).toBe(140)
        expect(migrated.preferences.maxTreeMapFiles).toBe(100)
    })

    it("should leave an existing center map zoom untouched", () => {
        // Arrange
        const alreadyMigrated = { preferences: { centerMapZoom: 165 } }

        // Act
        const migrated = migrateCcStateRecordToV21(alreadyMigrated) as unknown as { preferences: { centerMapZoom: number } }

        // Assert
        expect(migrated.preferences.centerMapZoom).toBe(165)
    })

    it("should pass a blob without preferences through unchanged", () => {
        // Arrange
        const withoutPreferences = { domainState: { topN: 25 } }

        // Act
        const migrated = migrateCcStateRecordToV21(withoutPreferences)

        // Assert
        expect(migrated).toBe(withoutPreferences)
    })

    it("should pass a nullish blob through unchanged", () => {
        // Arrange & Act & Assert
        expect(migrateCcStateRecordToV21(null)).toBeNull()
    })
})

describe("migrateCcStateRecordToV24 (radial folder colouring seed on the persisted preferences)", () => {
    it("should seed the default folder colouring on preferences persisted before it", () => {
        // Arrange
        const oldShapeState = { preferences: { centerMapZoom: 165 } }

        // Act
        const migrated = migrateCcStateRecordToV24(oldShapeState) as unknown as { preferences: Record<string, unknown> }

        // Assert
        expect(migrated.preferences).toEqual({
            centerMapZoom: 165,
            radialFolderValue: "max",
            radialFolderStyle: "tinted",
            radialFolderTint: 0.5
        })
    })

    it("should leave an existing folder colouring untouched", () => {
        // Arrange
        const alreadyMigrated = { preferences: { radialFolderValue: "median", radialFolderStyle: "neutral", radialFolderTint: 0.8 } }

        // Act
        const migrated = migrateCcStateRecordToV24(alreadyMigrated)

        // Assert
        expect(migrated).toBe(alreadyMigrated)
    })

    it("should pass a blob without preferences through unchanged", () => {
        // Arrange
        const withoutPreferences = { domainState: { topN: 25 } }

        // Act
        const migrated = migrateCcStateRecordToV24(withoutPreferences)

        // Assert
        expect(migrated).toBe(withoutPreferences)
    })

    it("should pass a nullish blob through unchanged", () => {
        // Arrange & Act & Assert
        expect(migrateCcStateRecordToV24(null)).toBeNull()
    })
})

describe("migrateCcStateRecordToV25 (radial level count seed on the persisted preferences)", () => {
    it("should seed the default level count on preferences persisted before it", () => {
        // Arrange
        const oldShapeState = { preferences: { centerMapZoom: 165 } }

        // Act
        const migrated = migrateCcStateRecordToV25(oldShapeState) as unknown as { preferences: Record<string, unknown> }

        // Assert
        expect(migrated.preferences).toEqual({ centerMapZoom: 165, radialLevels: 3 })
    })

    it("should leave an existing level count untouched", () => {
        // Arrange
        const alreadyMigrated = { preferences: { radialLevels: 7 } }

        // Act
        const migrated = migrateCcStateRecordToV25(alreadyMigrated)

        // Assert
        expect(migrated).toBe(alreadyMigrated)
    })

    it("should pass a blob without preferences through unchanged", () => {
        // Arrange
        const withoutPreferences = { domainState: { topN: 25 } }

        // Act
        const migrated = migrateCcStateRecordToV25(withoutPreferences)

        // Assert
        expect(migrated).toBe(withoutPreferences)
    })

    it("should pass a nullish blob through unchanged", () => {
        // Arrange & Act & Assert
        expect(migrateCcStateRecordToV25(null)).toBeNull()
    })
})
