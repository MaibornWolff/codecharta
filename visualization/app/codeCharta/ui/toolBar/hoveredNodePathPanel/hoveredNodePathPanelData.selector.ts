import { createSelector } from "../../../state/angular-redux/createSelector"
import { hoveredNodeSelector } from "../../../state/selectors/hoveredNode.selector"

export const hoveredNodePathPanelDataSelector = createSelector(
	[hoveredNodeSelector],
	hoveredNode =>
		hoveredNode && {
			path: hoveredNode.path.slice(1).split("/"),
			isFile: hoveredNode.type === "File"
		}
)
