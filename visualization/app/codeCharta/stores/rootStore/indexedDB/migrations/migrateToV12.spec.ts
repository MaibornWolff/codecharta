import { defaultPreferences } from "../../../preferences/preferences.read.facade"
import { migrateCcStateRecordToV12 } from "./migrateToV12"

describe("migrateCcStateRecordToV12 (Slice 10c sort-merge transform)", () => {
    const v11ShapeState = () => ({
        preferences: {
            isPresentationMode: true,
            maxTreeMapFiles: 42,
            sortingOption: "NUMBER_OF_FILES",
            sortingOrderAscending: false
        }
    })

    it("should nest the two flat sort prefs into a single preferences.sorting object", () => {
        const migrated = migrateCcStateRecordToV12(v11ShapeState()) as unknown as { preferences: Record<string, unknown> }

        expect(migrated.preferences.sorting).toEqual({ option: "NUMBER_OF_FILES", orderAscending: false })
    })

    it("should delete the two flat sort pref keys and keep the other preferences", () => {
        const migrated = migrateCcStateRecordToV12(v11ShapeState()) as unknown as { preferences: Record<string, unknown> }

        expect("sortingOption" in migrated.preferences).toBe(false)
        expect("sortingOrderAscending" in migrated.preferences).toBe(false)
        expect(migrated.preferences.maxTreeMapFiles).toBe(42)
    })

    it("should fall back to the sorting defaults when the flat keys are absent", () => {
        const migrated = migrateCcStateRecordToV12({ preferences: { maxTreeMapFiles: 42 } }) as unknown as {
            preferences: Record<string, unknown>
        }

        expect(migrated.preferences.sorting).toEqual(defaultPreferences.sorting)
    })

    it("should return the record untouched when it is null or has no preferences", () => {
        expect(migrateCcStateRecordToV12(null)).toBeNull()
        const migrated = migrateCcStateRecordToV12({ files: [] }) as unknown as { files: unknown[]; preferences?: unknown }
        expect(migrated.files).toEqual([])
        expect(migrated.preferences).toBeUndefined()
    })
})
