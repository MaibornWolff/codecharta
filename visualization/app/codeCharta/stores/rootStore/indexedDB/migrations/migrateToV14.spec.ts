import { migrateCcStateRecordToV14 } from "./migrateToV14"

describe("migrateCcStateRecordToV14 (Slice 14e-1 re-home transform)", () => {
    it("should move the interaction ids out of mapState into sharedView, nulled", () => {
        const migrated = migrateCcStateRecordToV14({
            mapState: { hoveredNodeId: 7, selectedBuildingId: 3, rightClickedNodeData: { nodeId: 9 }, scaling: 1 },
            sharedView: { blacklist: [] }
        }) as unknown as { mapState: Record<string, unknown>; sharedView: Record<string, unknown> }

        expect(migrated.sharedView.hoveredNodeId).toBeNull()
        expect(migrated.sharedView.selectedBuildingId).toBeNull()
        expect(migrated.sharedView.rightClickedNodeData).toBeNull()
        expect("hoveredNodeId" in migrated.mapState).toBe(false)
        expect("selectedBuildingId" in migrated.mapState).toBe(false)
        expect("rightClickedNodeData" in migrated.mapState).toBe(false)
        expect(migrated.mapState.scaling).toBe(1)
        expect(migrated.sharedView.blacklist).toEqual([])
    })

    it("should return the record untouched when it is null", () => {
        expect(migrateCcStateRecordToV14(null)).toBeNull()
    })
})
