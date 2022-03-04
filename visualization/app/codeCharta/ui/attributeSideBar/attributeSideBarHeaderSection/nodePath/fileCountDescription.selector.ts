import { createSelector } from "../../../../state/angular-redux/createSelector"
import { selectedNodeSelector } from "../../../../state/selectors/selectedNode.selector"

type Node2FileCountDescription = { attributes?: { unary?: number } }

export const node2fileCountDescription = (node?: Node2FileCountDescription) => {
	if (!node) {
		return
	}

	const fileCount = node.attributes.unary ?? 0
	if (fileCount === 0) {
		return "empty"
	}
	if (fileCount === 1) {
		return "1 file"
	}
	return `${fileCount} files`
}

export const fileCountDescriptionSelector = createSelector([selectedNodeSelector], node2fileCountDescription)
