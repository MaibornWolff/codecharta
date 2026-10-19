import { migrateCcStateRecordToV19 } from "./migrateToV19"

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
