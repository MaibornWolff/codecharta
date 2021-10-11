import { NodeType } from "../../../codeCharta.model"

export const rootNode = {
	name: "root",
	attributes: { unary: 3 },
	type: NodeType.FOLDER,
	isExcluded: false,
	isFlattened: false,
	children: [
		{
			name: "big leaf",
			type: NodeType.FILE,
			attributes: { rloc: 100, functions: 10, mcc: 1 },
			isExcluded: false,
			isFlattened: false,
			link: "http://www.google.de"
		},
		{
			name: "Parent Leaf",
			type: NodeType.FOLDER,
			attributes: { unary: 2 },
			isExcluded: false,
			isFlattened: false,
			children: [
				{
					name: "small leaf",
					type: NodeType.FILE,
					attributes: { rloc: 30, functions: 100, mcc: 100 },
					isExcluded: false,
					isFlattened: false
				},
				{
					name: "other small leaf",
					type: NodeType.FILE,
					attributes: { rloc: 70, functions: 1000, mcc: 10 },
					isExcluded: false,
					isFlattened: false
				}
			]
		}
	]
}
