import { createSelector } from "../../../../state/angular-redux/createSelector"
import { selectedNodeSelector } from "../../../../state/selectors/selectedNode.selector"

type Node2FileCountDescription = {
	attributes?: { unary?: number }
	deltas?: { addedFiles?: number; removedFiles?: number }
}

export interface FileCounter {
	fileCount: number
	added: number
	removed: number
}

export const node2fileCountDescription = (node?: Node2FileCountDescription) => {
	if (!node) return

	const fileCounter: FileCounter = {
		fileCount: 0,
		added: 0,
		removed: 0
	}

	fileCounter.fileCount = node.attributes.unary ?? 0

	if (node?.deltas) {
		fileCounter.added = node.deltas.addedFiles ?? 0
		fileCounter.removed = node.deltas.removedFiles ?? 0
	}

	return fileCounter
}

export const fileCountDescriptionSelector = createSelector([selectedNodeSelector], node2fileCountDescription)
