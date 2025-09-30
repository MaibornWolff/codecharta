export const aimedRatio: number = 1.618

export interface SquarifyNode {
    name: string
    value: number
    originalValue: number
    children: SquarifyNode[]
    rows: SquarifyRow[]
    hasLabel: boolean
    x0?: number
    y0?: number
    x1?: number
    y1?: number
    attributes?: any
}

export interface SquarifyRow {
    name: string
    dice: boolean
    children: SquarifyNode[]
}

export enum SortingOption {
    NONE = "none",
    ASCENDING = "ascending",
    DESCENDING = "descending",
    MIDDLE = "middle"
}

export enum OrderOption {
    NEW_ORDER = "newOrder",
    KEEP_ORDER = "keepOrder",
    KEEP_PLACE = "keepPlace"
}

export function squarify(
    parent: SquarifyNode,
    margin: number,
    scale: boolean,
    sortingOption: SortingOption,
    orderOption: OrderOption,
    labelsEnabled: boolean,
    labelLength: number,
    depth = 0
) {
    if (orderOption === OrderOption.KEEP_PLACE) {
        layoutNodeWithRows(parent, margin, scale, labelsEnabled, labelLength)
    } else if (orderOption === OrderOption.NEW_ORDER) {
        squarifyNode(parent, margin, scale, sortingOption, labelsEnabled, labelLength, false)
    } else if (orderOption === OrderOption.KEEP_ORDER) {
        squarifyNode(parent, margin, scale, sortingOption, labelsEnabled, labelLength, true)
    }
    for (const child of parent.children) {
        if (child.children?.length > 0) {
            squarify(child, margin, scale, sortingOption, orderOption, labelsEnabled, labelLength, depth + 1)
        }
    }
}

function layoutNodeWithRows(parent: SquarifyNode, margin: number, scale: boolean, labelsEnabled: boolean, labelLength: number) {
    const nodes: SquarifyNode[] = parent.children
    if (!nodes || nodes.length === 0 || !parent.rows || parent.rows.length === 0) {
        return
    }

    const isLeaf = !parent.children || parent.children.length === 0
    const needsLabel = labelsEnabled && parent.hasLabel && !isLeaf

    const parentWidth = parent.x1 - parent.x0 - margin * 2
    let parentLength = parent.y1 - parent.y0 - margin * 2

    if (needsLabel) {
        parentLength -= labelLength
    }

    const totalArea = parentWidth * parentLength

    // Scale children values if needed
    if (scale) {
        const totalChildrenValue = nodes.reduce((sum, child) => sum + child.value, 0)
        if (totalChildrenValue === 0) {
            return
        }

        const scaleValue = totalArea / totalChildrenValue
        for (const child of nodes) {
            child.value *= scaleValue
        }
    }

    // Reset coordinates for placement
    let x0 = parent.x0 + margin
    let y0 = parent.y0 + margin
    const x1 = parent.x1 - margin
    const y1 = parent.y1 - margin

    if (needsLabel) {
        y0 += labelLength
    }

    // Calculate total row values for proportional allocation
    let remainingArea = totalArea

    // Position each row with proper proportions
    for (const row of parent.rows) {
        const width = x1 - x0
        const length = y1 - y0
        const rowValue = row.children.reduce((sum, child) => sum + child.value, 0)

        if (rowValue === 0) {
            continue
        }

        if (row.dice) {
            const rowHeight = rowValue / width
            treemapDice(rowValue, row.children, x0, y0, x1, y0 + rowHeight)
            y0 += rowHeight
        } else {
            const rowWidth = rowValue / length
            treemapSlice(rowValue, row.children, x0, y0, x0 + rowWidth, y1)
            x0 += rowWidth
        }

        remainingArea -= rowValue
    }
}

function squarifyNode(
    parent: SquarifyNode,
    margin: number,
    scale: boolean,
    sortingOption: SortingOption = SortingOption.NONE,
    labelsEnabled: boolean,
    labelLength: number,
    orderByOriginalValue: boolean
) {
    const nodes: SquarifyNode[] = parent.children
    const isLeaf = !parent.children || parent.children.length === 0
    const needsLabel = labelsEnabled && parent.hasLabel && !isLeaf

    // Sort nodes based on the sorting option
    if (sortingOption !== SortingOption.NONE && nodes && nodes.length > 0) {
        nodes.sort((a, b) => {
            if (sortingOption === SortingOption.ASCENDING) {
                if (orderByOriginalValue) {
                    return a.originalValue - b.originalValue
                }
                return a.value - b.value
            }
            if (orderByOriginalValue) {
                return b.originalValue - a.originalValue
            }
            return b.value - a.value
        })
    }

    // Apply margin differently based on applySiblingMargin option
    let x0 = parent.x0 + margin
    let y0 = parent.y0 + margin
    const x1 = parent.x1 - margin
    const y1 = parent.y1 - margin

    if (needsLabel) {
        y0 += labelLength
    }

    const numberOfChildren = nodes.length

    let row: SquarifyRow,
        i = 0,
        j = 0,
        width: number,
        length: number,
        value = (x1 - x0) * (y1 - y0),
        sumValue: number,
        minValue: number,
        maxValue: number,
        newRatio: number,
        minRatio: number,
        alpha: number,
        beta: number

    if (scale) {
        if (nodes && nodes.length > 0) {
            let childrenValues = 0
            for (const child of nodes) {
                if (child.value !== undefined && !isNaN(child.value)) {
                    childrenValues += child.value
                }
            }
            if (childrenValues === 0) {
                return
            }
            const scaleValue = value / childrenValues
            for (const child of nodes) {
                child.value *= scaleValue
            }
        }
    }

    while (i < numberOfChildren) {
        width = x1 - x0
        length = y1 - y0

        // Find the next non-empty node.
        do {
            sumValue = nodes[j++].value
        } while (!sumValue && j < numberOfChildren)

        minValue = maxValue = sumValue
        alpha = Math.max(length / width, width / length) / (value * aimedRatio)
        beta = sumValue * sumValue * alpha
        minRatio = Math.max(maxValue / beta, beta / minValue)

        // Keep adding nodes while the aspect ratio maintains or improves.
        for (; j < numberOfChildren; ++j) {
            const nodeValue = nodes[j].value
            sumValue += nodeValue
            if (nodeValue < minValue) {
                minValue = nodeValue
            }
            if (nodeValue > maxValue) {
                maxValue = nodeValue
            }
            beta = sumValue * sumValue * alpha
            newRatio = Math.max(maxValue / beta, beta / minValue)
            if (newRatio > minRatio) {
                sumValue -= nodeValue
                break
            }
            minRatio = newRatio
        }

        row = { name: parent.name, dice: width < length, children: nodes.slice(i, j) }
        if (row.dice) {
            treemapDice(sumValue, row.children, x0, y0, x1, value ? (y0 += (length * sumValue) / value) : y0)
        } else {
            treemapSlice(sumValue, row.children, x0, y0, value ? (x0 += (width * sumValue) / value) : x0, y1)
        }
        value -= sumValue
        i = j
        parent.rows.push(row)
    }
}

function treemapDice(parentValue: number, children: SquarifyNode[], x0: number, y0: number, x1: number, y1: number): void {
    const k = parentValue ? (x1 - x0) / parentValue : 0

    if (x1 - x0 <= 0 || y1 - y0 <= 0) {
        for (const element of children) {
            element.x0 = x0
            element.x1 = x0
            element.y0 = y0
            element.y1 = y0
        }
    }

    for (const element of children) {
        element.y0 = y0
        element.y1 = y1
        element.x0 = x0
        element.x1 = x0 += element.value * k
    }
}

function treemapSlice(parentValue: number, children: SquarifyNode[], x0: number, y0: number, x1: number, y1: number): void {
    const k = parentValue ? (y1 - y0) / parentValue : 0

    if (x1 - x0 <= 0 || y1 - y0 <= 0) {
        for (const element of children) {
            element.x0 = x0
            element.x1 = x0
            element.y0 = y0
            element.y1 = y0
        }
    }

    for (const element of children) {
        element.x0 = x0
        element.x1 = x1
        element.y0 = y0
        element.y1 = y0 += element.value * k
    }
}
