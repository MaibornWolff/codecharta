import { hierarchy } from "d3-hierarchy"
import { CodeMapNode, NodeType } from "../../../codeCharta.model"

export type FileToValue = { name: string; value: number }

const MAX_ENTRIES = 10

export function getFilenamesWithHighestMetrics(node: Pick<CodeMapNode, "children" | "type" | "attributes" | "name">) {
	const fileToValueByAttributes = new Map<string, FileToValue[]>()
	for (const { data } of hierarchy(node)) {
		if (data.type === NodeType.FILE && data.attributes) {
			for (const [key, value] of Object.entries(data.attributes)) {
				updateAttributeMap(key, value, data.name, fileToValueByAttributes)
			}
		}
	}
	return fileToValueByAttributes
}

export function updateAttributeMap(key: string, value: number, fileName: string, map: Map<string, FileToValue[]>) {
	const keyIsNew = !map.has(key)
	if (keyIsNew) {
		map.set(key, [{ name: fileName, value }])
		return
	}

	const newPair = { name: fileName, value }
	const previousValues = map.get(key)
	if (previousValues.length < MAX_ENTRIES) {
		insertSorted(previousValues, newPair)
		return
	}

	insertInFullDescendingList(newPair, previousValues)
}

function insertSorted(array: FileToValue[], newPair: FileToValue) {
	let index
	for (index = array.length - 1; index >= 0 && array[index].value <= newPair.value; index--) {
		array[index + 1] = array[index]
	}
	array[index + 1] = newPair
}

function insertInFullDescendingList<T extends { value: number }>(newItem: T, descendingList: T[]): void {
	let index = descendingList.length - 1
	while (index >= 0) {
		const oldItem = descendingList[index]

		if (oldItem.value < newItem.value) {
			const afterFirstLoop = index < descendingList.length - 1
			if (afterFirstLoop) {
				descendingList[index + 1] = oldItem
			}

			const atLastLoop = index === 0
			if (atLastLoop) {
				descendingList[index] = newItem
			}
		} else {
			const newValueTooSmall = index === descendingList.length - 1
			if (!newValueTooSmall) {
				descendingList[index + 1] = newItem
			}

			break
		}
		index--
	}
}
