import { hierarchy } from "d3-hierarchy"
import { CodeMapNode, NodeType } from "../../codeCharta.model"

export type ParentNode = Pick<CodeMapNode, "children">
type FileNamesByMetrics = Map<string, string[]>
export type FileToValue = { name: string; value: number }

const MAX_ENTRIES = 10

export function getFilenamesWithHighestMetrics(parent: CodeMapNode) {
	return parse(parent)
}

function parse(map: CodeMapNode): FileNamesByMetrics {
	const fileNamesByMetrics = new Map<string, FileToValue[]>()
	for (const { data } of hierarchy(map)) {
		if (data.type === NodeType.FILE && data.attributes) {
			for (const [key, value] of Object.entries(data.attributes)) {
				maybeAddToMap(key, value, data.name, fileNamesByMetrics)
			}
		}
	}
	return new Map<string, string[]>()
}

//TODO: Improve Perfomance
export function maybeAddToMap(key: string, value: number, fileName: string, map: Map<string, FileToValue[]>) {
	const keyIsNew = !map.has(key)
	if (keyIsNew) {
		map.set(key, [{ name: fileName, value }])
		return
	}

	const previousValues = map.get(key)
	if (previousValues.length < MAX_ENTRIES) {
		map.set(key, [...previousValues, { name: fileName, value }])
	} else {
		const minValue = Math.min(...previousValues.map(pair => pair.value), value)
		const shouldAddToMap = minValue < value
		if (shouldAddToMap) {
			const minValuePair = previousValues.find(pair => (pair.value = minValue))
			// checking name and value, because different files could have the same name
			const filteredPreviousValues = previousValues.filter(
				pair => pair.name !== minValuePair.name || pair.value !== minValuePair.value
			)
			const newPairs = [...filteredPreviousValues, { name: fileName, value }]
			map.set(key, newPairs)
		}
	}
}
