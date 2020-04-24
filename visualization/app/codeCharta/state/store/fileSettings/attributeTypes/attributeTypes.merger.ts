import _ from "lodash"
import { AttributeTypes } from "../../../../codeCharta.model"

export function getMergedAttributeTypes(allAttributeTypes: AttributeTypes[]): AttributeTypes {
	const attributeTypesNodes = {}
	const attributeTypesEdges = {}

	for (const attributeTypes of allAttributeTypes) {
		for (const metric of Object.keys(attributeTypes.nodes)) {
			if (!attributeTypesNodes[metric]) {
				attributeTypesNodes[metric] = attributeTypes.nodes[metric]
			}
		}

		for (const metric of Object.keys(attributeTypes.edges)) {
			if (!attributeTypesEdges[metric]) {
				attributeTypesEdges[metric] = attributeTypes.edges[metric]
			}
		}
	}

	return {
		nodes: attributeTypesNodes,
		edges: attributeTypesEdges
	}
}
