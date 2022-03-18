import { NodeType } from "../../../../codeCharta.model"

export const rootNode = {
	name: "root",
	path: "/root",
	attributes: { unary: 2 },
	type: NodeType.FOLDER,
	isExcluded: false,
	isFlattened: false,
	children: [
		{
			name: "bigLeaf",
			path: "/root/bigLeaf",
			type: NodeType.FILE,
			attributes: {},
			isExcluded: false,
			isFlattened: false
		},
		{
			name: "ParentLeaf",
			path: "/root/ParentLeaf",
			type: NodeType.FOLDER,
			attributes: { unary: 1 },
			isExcluded: false,
			isFlattened: false,
			children: [
				{
					name: "smallLeaf",
					path: "/root/ParentLeaf/smallLeaf",
					type: NodeType.FILE,
					attributes: {},
					isExcluded: false,
					isFlattened: false
				}
			]
		}
	]
}
