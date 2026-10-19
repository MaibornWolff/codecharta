import { migrateCcStateRecordToV8 } from "./migrateToV8"

describe("migrateCcStateRecordToV8 (Slice 9b re-home transform)", () => {
    const v7ShapeState = () => ({
        fileSettings: {
            blacklist: [{ path: "/root/excluded", type: "exclude" }],
            edges: [],
            markedPackages: []
        },
        sharedView: {
            focusedNodePath: ["/root/ParentLeaf"],
            searchPattern: "needle"
        }
    })

    it("should move blacklist from fileSettings into the EXISTING sharedView root, preserving its other keys", () => {
        const migrated = migrateCcStateRecordToV8(v7ShapeState()) as unknown as { sharedView: Record<string, unknown> }

        expect(migrated.sharedView.blacklist).toEqual([{ path: "/root/excluded", type: "exclude" }])
        expect(migrated.sharedView.focusedNodePath).toEqual(["/root/ParentLeaf"])
        expect(migrated.sharedView.searchPattern).toBe("needle")
    })

    it("should drop blacklist from fileSettings and keep the staying ones", () => {
        const migrated = migrateCcStateRecordToV8(v7ShapeState()) as unknown as { fileSettings: Record<string, unknown> }

        expect("blacklist" in migrated.fileSettings).toBe(false)
        expect(migrated.fileSettings.edges).toEqual([])
        expect(migrated.fileSettings.markedPackages).toEqual([])
    })

    it("should fill the sharedView rule lists with their defaults when absent from the old blob", () => {
        const migrated = migrateCcStateRecordToV8({ fileSettings: {} }) as unknown as { sharedView: Record<string, unknown> }

        // the v8 shape seeds the sharedView from the defaults, which now hold the two split lists
        expect(migrated.sharedView.blacklist).toBeUndefined()
        expect(migrated.sharedView.excludedNodes).toEqual([])
        expect(migrated.sharedView.flattenedNodes).toEqual([])
    })

    it("should return the record untouched when it is null, and build a default sharedView when there is no fileSettings", () => {
        expect(migrateCcStateRecordToV8(null)).toBeNull()
        const migrated = migrateCcStateRecordToV8({ files: [] }) as unknown as { files: unknown[]; sharedView: Record<string, unknown> }
        expect(migrated.files).toEqual([])
        expect(migrated.sharedView.excludedNodes).toEqual([])
    })
})
