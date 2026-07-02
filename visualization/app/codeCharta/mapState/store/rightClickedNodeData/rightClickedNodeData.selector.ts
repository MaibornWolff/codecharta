import { createSelector } from "@ngrx/store"
import { mapStateSelector } from "../mapState.selector"

export const rightClickedNodeDataSelector = createSelector(mapStateSelector, mapState => mapState.rightClickedNodeData)
