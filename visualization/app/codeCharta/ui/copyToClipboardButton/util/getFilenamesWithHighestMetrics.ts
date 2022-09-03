import { hierarchy } from "d3-hierarchy"
import { CodeMapNode, NodeType } from "../../../codeCharta.model"

export type FileToValue = { filePath: string; value: number }

const MAX_ENTRIES = 10

type ReducedCodeMapNode = Pick<CodeMapNode, "type" | "attributes" | "path"> & { children?: ReducedCodeMapNode[] }

export function getFilenamesWithHighestMetrics(node: ReducedCodeMapNode) {
	const fileToValueByAttributes = new Map<string, FileToValue[]>()
	for (const { data } of hierarchy(node)) {
		if (data.type === NodeType.FILE && data.attributes) {
			for (const [key, value] of Object.entries(data.attributes)) {
				updateAttributeMap(key, value, data.path, fileToValueByAttributes)
			}
		}
	}
	return fileToValueByAttributes
}

export function updateAttributeMap(key: string, value: number, filePath: string, map: Map<string, FileToValue[]>) {
	const newPair = { filePath, value }

	const keyIsNew = !map.has(key)
	if (keyIsNew) {
		map.set(key, [newPair])
		return
	}

	const previousValues = map.get(key)

	insertSorted(previousValues, newPair)
	map.set(key, previousValues.slice(0, MAX_ENTRIES))
}

function insertSorted(array: FileToValue[], newPair: FileToValue) {
	let index
	for (index = array.length - 1; index >= 0 && array[index].value <= newPair.value; index--) {
		array[index + 1] = array[index]
	}
	array[index + 1] = newPair
}
