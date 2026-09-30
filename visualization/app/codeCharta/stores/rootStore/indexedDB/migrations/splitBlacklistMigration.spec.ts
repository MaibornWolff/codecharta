import { migrateCcStateRecordToV22 } from "./splitBlacklistMigration"

describe("migrateCcStateRecordToV22 (blacklist split into excluded and flattened nodes)", () => {
    it("should split the one list into the two the app now keeps", () => {
        // Arrange
        const record = {
            sharedView: {
                blacklist: [
                    { path: "/root/a.ts", type: "exclude" },
                    { path: "/root/b.ts", type: "flatten", nodeType: "File" }
                ],
                searchPattern: "keep me"
            }
        }

        // Act
        const migrated = migrateCcStateRecordToV22(record) as unknown as { sharedView: Record<string, unknown> }

        // Assert — the effect moves from the entry to the list it sits in
        expect(migrated.sharedView.excludedNodes).toEqual([{ path: "/root/a.ts" }])
        expect(migrated.sharedView.flattenedNodes).toEqual([{ path: "/root/b.ts", nodeType: "File" }])
        expect(migrated.sharedView.blacklist).toBeUndefined()
        expect(migrated.sharedView.searchPattern).toBe("keep me")
    })

    it("should leave a record that has already been split untouched", () => {
        // Arrange
        const record = { sharedView: { excludedNodes: [{ path: "/root/a.ts" }], flattenedNodes: [] } }

        // Act
        const migrated = migrateCcStateRecordToV22(record)

        // Assert
        expect(migrated).toBe(record)
    })

    it("should return the record untouched when it is null", () => {
        // Act & Assert
        expect(migrateCcStateRecordToV22(null)).toBeNull()
    })
})
