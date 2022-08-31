// type Node = {
// 	children?: Node[]
// 	name: string
// 	type: NodeType
// }

/*
export const getCollapsedRoot = (node: Node): string => {
	if (!node.children) {
		return `${node.name}/`
	}

	if (node.children.length !== 1) {
		return `${node.name}/`
	}

	const onlyChild = node.children[0]
	if (onlyChild.type !== NodeType.FOLDER) {
		return `${node.name}/`
	}

	return `${node.name}/${getCollapsedRoot(onlyChild)}`
}
*/

export const haveSameRoots = (reference: string, comparison: string): boolean => {
	const referenceRoot = reference.split("/")[0]
	const comparisonRoot = comparison.split("/")[0]

	return referenceRoot === comparisonRoot
}
