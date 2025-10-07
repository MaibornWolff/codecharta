import { CodeMapNode, NodeType, SortingOption } from "../../../../../codeCharta.model"

type CompareFunction = (a: CodeMapNode, b: CodeMapNode) => number

const nameCollator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" })
const sortByName: CompareFunction = (a, b) => nameCollator.compare(a.name, b.name)
const sortByUnary: CompareFunction = (a, b) => a.attributes.unary - b.attributes.unary

const getCompareFunction = (sortingOrder: SortingOption, sortingOrderAscending: boolean) => {
    const compareFunction = sortingOrder === SortingOption.NUMBER_OF_FILES ? sortByUnary : sortByName
    return sortingOrderAscending ? compareFunction : (a: CodeMapNode, b: CodeMapNode) => -1 * compareFunction(a, b)
}

const groupAndSortNodeByFilesAndFolders = (compareFunction: CompareFunction, node: CodeMapNode) => {
    const folders: CodeMapNode[] = []
    const files: CodeMapNode[] = []

    for (const child of node.children) {
        if (child.type === NodeType.FOLDER) {
            folders.push(child)
        } else {
            files.push(child)
        }
    }

    folders.sort(compareFunction)
    files.sort(compareFunction)

    return [...folders, ...files]
}

export const sortNodesInPlace = (node: CodeMapNode, sortingOrder: SortingOption, sortingOrderAscending: boolean): CodeMapNode => {
    if (!node?.children || node.children.length === 0) {
        return node
    }

    for (const element of node.children) {
        if (element.type === NodeType.FOLDER) {
            sortNodesInPlace(element, sortingOrder, sortingOrderAscending)
        }
    }

    const compareFunction = getCompareFunction(sortingOrder, sortingOrderAscending)
    node.children = groupAndSortNodeByFilesAndFolders(compareFunction, node)

    return node
}
