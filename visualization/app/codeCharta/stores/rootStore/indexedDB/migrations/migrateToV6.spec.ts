import { defaultSharedView } from "../../../sharedView/sharedView.read.facade"
import { migrateCcStateRecordToV6 } from "./migrateToV6"

describe("migrateCcStateRecordToV6 (Slice 8 re-home transform)", () => {
    const v5ShapeState = () => ({
        dynamicSettings: {
            sortingOption: "NAME",
            focusedNodePath: ["/root/ParentLeaf"],
            searchPattern: "needle"
        }
    })

    it("should move focusedNodePath + searchPattern from dynamicSettings into a brand-new sharedView root", () => {
        const migrated = migrateCcStateRecordToV6(v5ShapeState()) as unknown as { sharedView: Record<string, unknown> }

        expect(migrated.sharedView.focusedNodePath).toEqual(["/root/ParentLeaf"])
        expect(migrated.sharedView.searchPattern).toBe("needle")
    })

    it("should drop the moved keys from dynamicSettings and keep the staying ones", () => {
        const migrated = migrateCcStateRecordToV6(v5ShapeState()) as unknown as { dynamicSettings: Record<string, unknown> }

        expect("focusedNodePath" in migrated.dynamicSettings).toBe(false)
        expect("searchPattern" in migrated.dynamicSettings).toBe(false)
        expect(migrated.dynamicSettings.sortingOption).toBe("NAME")
    })

    it("should fill sharedView keys absent from the old blob with their defaults", () => {
        const migrated = migrateCcStateRecordToV6({ dynamicSettings: {} }) as unknown as { sharedView: Record<string, unknown> }

        expect(migrated.sharedView.focusedNodePath).toEqual(defaultSharedView.focusedNodePath)
        expect(migrated.sharedView.searchPattern).toBe(defaultSharedView.searchPattern)
    })

    it("should return the record untouched when it is null, and build a default sharedView when there is no dynamicSettings", () => {
        expect(migrateCcStateRecordToV6(null)).toBeNull()
        const migrated = migrateCcStateRecordToV6({ files: [] }) as unknown as { files: unknown[]; sharedView: Record<string, unknown> }
        expect(migrated.files).toEqual([])
        expect(migrated.sharedView.focusedNodePath).toEqual(defaultSharedView.focusedNodePath)
    })
})
