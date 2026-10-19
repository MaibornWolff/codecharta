import { defaultSharedView } from "../../../sharedView/sharedView.read.facade"

// v14: hoveredNodeId/selectedBuildingId/rightClickedNodeData → sharedView (was mapState; seed as null)
export function migrateCcStateRecordToV14<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const sharedView: Record<string, unknown> = { ...defaultSharedView, ...(record["sharedView"] as Record<string, unknown>) }
    const next: Record<string, unknown> = { ...record }
    const mapState = record["mapState"]
    if (mapState && typeof mapState === "object") {
        const trimmed = { ...(mapState as Record<string, unknown>) }
        delete trimmed["hoveredNodeId"]
        delete trimmed["selectedBuildingId"]
        delete trimmed["rightClickedNodeData"]
        next["mapState"] = trimmed
    }
    sharedView["hoveredNodeId"] = null
    sharedView["selectedBuildingId"] = null
    sharedView["rightClickedNodeData"] = null
    next["sharedView"] = sharedView
    return next as T
}
