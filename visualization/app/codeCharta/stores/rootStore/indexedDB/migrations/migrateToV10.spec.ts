import { migrateCcStateRecordToV10 } from "./migrateToV10"

describe("migrateCcStateRecordToV10 (Slice 10a re-home transform)", () => {
    const v9ShapeState = () => ({
        appSettings: { maxTreeMapFiles: 100, isLoadingFile: false },
        appStatus: { currentFilesAreSampleFiles: true }
    })

    it("should promote isLoadingFile + currentFilesAreSampleFiles to their own top-level roots", () => {
        const migrated = migrateCcStateRecordToV10(v9ShapeState()) as unknown as {
            isLoadingFile: boolean
            currentFilesAreSampleFiles: boolean
        }

        expect(migrated.isLoadingFile).toBe(false)
        expect(migrated.currentFilesAreSampleFiles).toBe(true)
    })

    it("should drop isLoadingFile from appSettings and delete the now-empty appStatus grab-bag", () => {
        const migrated = migrateCcStateRecordToV10(v9ShapeState()) as unknown as {
            appSettings: Record<string, unknown>
            appStatus?: Record<string, unknown>
        }

        expect("isLoadingFile" in migrated.appSettings).toBe(false)
        expect(migrated.appSettings.maxTreeMapFiles).toBe(100)
        expect(migrated.appStatus).toBeUndefined()
    })

    it("should return the record untouched when it is null, and just drop appStatus when the flags are absent", () => {
        expect(migrateCcStateRecordToV10(null)).toBeNull()
        const migrated = migrateCcStateRecordToV10({ files: [] }) as unknown as { files: unknown[] }
        expect(migrated.files).toEqual([])
        expect("appStatus" in (migrated as object)).toBe(false)
    })
})
