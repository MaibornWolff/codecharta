import { migrateCcStateRecordToV15 } from "./migrateToV15"

describe("migrateCcStateRecordToV15 (Slice 15e fileSettings-drop transform)", () => {
    const v14ShapeState = () => ({
        fileSettings: { edges: [{ fromNodeName: "/root/a", toNodeName: "/root/b", attributes: {} }] },
        sharedView: { blacklist: [], hoveredNodeId: null, selectedBuildingId: null, rightClickedNodeData: null },
        mapState: { scaling: 1 }
    })

    it("should drop the whole fileSettings root now that edges is a derived dependency-lens selector", () => {
        // Arrange
        const oldShapeState = v14ShapeState()

        // Act
        const migrated = migrateCcStateRecordToV15(oldShapeState) as unknown as { fileSettings?: Record<string, unknown> }

        // Assert
        expect(migrated.fileSettings).toBeUndefined()
    })

    it("should leave every other root untouched", () => {
        // Arrange
        const oldShapeState = v14ShapeState()

        // Act
        const migrated = migrateCcStateRecordToV15(oldShapeState) as unknown as {
            sharedView: Record<string, unknown>
            mapState: Record<string, unknown>
        }

        // Assert
        expect(migrated.sharedView).toEqual({ blacklist: [], hoveredNodeId: null, selectedBuildingId: null, rightClickedNodeData: null })
        expect(migrated.mapState).toEqual({ scaling: 1 })
    })

    it("should return the record untouched when it is null or already has no fileSettings", () => {
        // Arrange / Act / Assert
        expect(migrateCcStateRecordToV15(null)).toBeNull()
        const migrated = migrateCcStateRecordToV15({ files: [] }) as unknown as { files: unknown[]; fileSettings?: unknown }
        expect(migrated.files).toEqual([])
        expect(migrated.fileSettings).toBeUndefined()
    })
})
