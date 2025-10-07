import { CodeMapNode, NodeType, SortingOption } from "../../../../../codeCharta.model"

type CompareFunction = (a: CodeMapNode, b: CodeMapNode) => number

const nameCollator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" })
const createSortByName = (ascending: boolean): CompareFunction => {
    return (a, b) => {
        const diff = nameCollator.compare(a.name, b.name)
        return ascending ? diff : diff * -1
    }
}
const createSortByUnary = (ascending: boolean): CompareFunction => {
    return (a, b) => {
        const diff = a.attributes.unary - b.attributes.unary
        return ascending ? diff : diff * -1
    }
}

const createSortByAreaMetric = (areaMetric: string, ascending: boolean): CompareFunction => {
    return (a, b) => {
        const aValue = a.attributes[areaMetric] ?? 0
        const bValue = b.attributes[areaMetric] ?? 0
        const diff = ascending ? aValue - bValue : bValue - aValue
        return diff || createSortByName(ascending)(a, b)
    }
}

const getCompareFunction = (sortingOrder: SortingOption, sortingOrderAscending: boolean, areaMetric?: string) => {
    switch (sortingOrder) {
        case SortingOption.AREA_SIZE:
            return createSortByAreaMetric(areaMetric, sortingOrderAscending)
        case SortingOption.NUMBER_OF_FILES:
            return createSortByUnary(sortingOrderAscending)
        default:
            return createSortByName(sortingOrderAscending)
    }
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

export const sortNodesInPlace = (
    node: CodeMapNode,
    sortingOrder: SortingOption,
    sortingOrderAscending: boolean,
    areaMetric?: string
): CodeMapNode => {
    if (!node?.children || node.children.length === 0) {
        return node
    }

    for (const element of node.children) {
        if (element.type === NodeType.FOLDER) {
            sortNodesInPlace(element, sortingOrder, sortingOrderAscending, areaMetric)
        }
    }

    const compareFunction = getCompareFunction(sortingOrder, sortingOrderAscending, areaMetric)
    node.children = groupAndSortNodeByFilesAndFolders(compareFunction, node)

    return node
}
