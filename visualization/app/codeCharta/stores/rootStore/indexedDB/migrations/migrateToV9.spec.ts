import { defaultSharedView } from "../../../sharedView/sharedView.read.facade"
import { migrateCcStateRecordToV9 } from "./migrateToV9"

describe("migrateCcStateRecordToV9 (Slice 9c re-home transform)", () => {
    const v8ShapeState = () => ({
        fileSettings: {
            edges: [],
            markedPackages: [{ path: "/root/src", color: "#FF0000" }]
        },
        sharedView: {
            focusedNodePath: ["/root/ParentLeaf"],
            searchPattern: "needle",
            blacklist: [{ path: "/root/excluded", type: "exclude" }]
        }
    })

    it("should move markedPackages from fileSettings into the EXISTING sharedView root, preserving its other keys", () => {
        const migrated = migrateCcStateRecordToV9(v8ShapeState()) as unknown as { sharedView: Record<string, unknown> }

        expect(migrated.sharedView.markedPackages).toEqual([{ path: "/root/src", color: "#FF0000" }])
        expect(migrated.sharedView.blacklist).toEqual([{ path: "/root/excluded", type: "exclude" }])
        expect(migrated.sharedView.focusedNodePath).toEqual(["/root/ParentLeaf"])
        expect(migrated.sharedView.searchPattern).toBe("needle")
    })

    it("should drop markedPackages from fileSettings and keep the staying ones", () => {
        const migrated = migrateCcStateRecordToV9(v8ShapeState()) as unknown as { fileSettings: Record<string, unknown> }

        expect("markedPackages" in migrated.fileSettings).toBe(false)
        expect(migrated.fileSettings.edges).toEqual([])
    })

    it("should fill sharedView markedPackages with its default when absent from the old blob", () => {
        const migrated = migrateCcStateRecordToV9({ fileSettings: {} }) as unknown as { sharedView: Record<string, unknown> }

        expect(migrated.sharedView.markedPackages).toEqual(defaultSharedView.markedPackages)
    })

    it("should return the record untouched when it is null, and build a default sharedView markedPackages when there is no fileSettings", () => {
        expect(migrateCcStateRecordToV9(null)).toBeNull()
        const migrated = migrateCcStateRecordToV9({ files: [] }) as unknown as { files: unknown[]; sharedView: Record<string, unknown> }
        expect(migrated.files).toEqual([])
        expect(migrated.sharedView.markedPackages).toEqual(defaultSharedView.markedPackages)
    })
})
