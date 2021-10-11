import { NodeType } from "../../../codeCharta.model"

export const rootNode = {
	name: "root",
	attributes: { unary: 2 },
	type: NodeType.FOLDER,
	isExcluded: false,
	isFlattened: false,
	children: [
		{
			name: "big leaf",
			type: NodeType.FILE,
			attributes: {},
			isExcluded: false,
			isFlattened: false
		},
		{
			name: "Parent Leaf",
			type: NodeType.FOLDER,
			attributes: { unary: 1 },
			isExcluded: false,
			isFlattened: false,
			children: [
				{
					name: "small leaf",
					type: NodeType.FILE,
					attributes: {},
					isExcluded: false,
					isFlattened: false
				}
			]
		}
	]
}
