import { hierarchy } from "d3-hierarchy"
import { CodeMapNode, NodeType } from "../../codeCharta.model"

export function getFilenamesWithHighestMetrics(fileStates: CodeMapNode) {
	return fileStates[0].file.map
}

export function parse(map: CodeMapNode): FileNamesByMetrics {
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

type FileNamesByMetrics = Map<string, string[]>
type FileToValue = { name: string; value: number }
//sry Ruben
function maybeAddToMap(key: string, value: number, fileName: string, map: Map<string, FileToValue[]>) {
	const keyIsNew = !map.has(key)
	if (keyIsNew) {
		map.set(key, [{ name: fileName, value }])
	} else {
		const previousValues = map.get(key)
		if (previousValues.length < 10) {
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
}
