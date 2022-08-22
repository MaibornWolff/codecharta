import { NodeType } from "../../../../codeCharta.model"

type Node = {
	children?: Node[]
	name: string
	type: NodeType
}

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

export const compareCollapsedRoots = (reference: Node, comp: Node): boolean => {
	const referenceRoot = getCollapsedRoot(reference)
	const compRoot = getCollapsedRoot(comp)

	return referenceRoot.includes(compRoot) || compRoot.includes(referenceRoot)
}
