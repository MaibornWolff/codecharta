import { addToGroup, maxOf } from "./collections"
import { LAYOUT_SPACING } from "./layoutModel"
import { LeveledNode } from "./leveledTree"

/** The shape every open folder aims for, close to a screen, so neither a long level nor a deep stack
 * of levels stretches it into a strip. */
const TARGET_ASPECT_RATIO = 16 / 10

/** A node box is four times as wide as it is tall, so the aspect ratio alone would stack even a handful
 * of files into a column. A row of six still fits a laptop screen at full size. */
const MIN_NODES_PER_ROW = 6
const MIN_DECLARATIONS_PER_ROW = 2

export interface ContentSpacing {
    gapBetweenNodes: number
    gapBetweenRows: number
    gapBetweenGroups: number
    /** A group is not wrapped before its row is this wide. */
    unwrappedRowWidth: number
}

const FOLDER_CONTENT: ContentSpacing = {
    gapBetweenNodes: LAYOUT_SPACING.gapBetweenNodes,
    gapBetweenRows: LAYOUT_SPACING.gapBetweenRows,
    gapBetweenGroups: LAYOUT_SPACING.gapBetweenLevels,
    unwrappedRowWidth: MIN_NODES_PER_ROW * LAYOUT_SPACING.nodeWidth + (MIN_NODES_PER_ROW - 1) * LAYOUT_SPACING.gapBetweenNodes
}

const DECLARATION_GAP = 8
const DECLARATION_ROW_GAP = 6
const UNWRAPPED_DECLARATION_ROW_WIDTH =
    MIN_DECLARATIONS_PER_ROW * LAYOUT_SPACING.declarationWidth + (MIN_DECLARATIONS_PER_ROW - 1) * DECLARATION_GAP

const DECLARATION_CONTENT: ContentSpacing = {
    gapBetweenNodes: DECLARATION_GAP,
    gapBetweenRows: DECLARATION_ROW_GAP,
    gapBetweenGroups: DECLARATION_ROW_GAP,
    unwrappedRowWidth: UNWRAPPED_DECLARATION_ROW_WIDTH
}

/** Levels inside a file get the room a folder gives them, for their label and separator. */
const LEVELED_FILE_CONTENT: ContentSpacing = { ...DECLARATION_CONTENT, gapBetweenGroups: LAYOUT_SPACING.gapBetweenLevels }

interface Size {
    width: number
    height: number
}

export interface Row {
    /** The rows a group wraps into stay close together; in a folder a group is a level. */
    group: number
    level: number
    nodes: LeveledNode[]
    width: number
    height: number
}

interface ContainerPlan extends Size {
    rows: Row[]
    innerWidth: number
    spacing: ContentSpacing
    /** Whether the rows are told apart by level, with a label and a separator each. */
    isLeveled: boolean
}

export class ContainerMeasurer {
    private readonly plans = new Map<string, ContainerPlan>()

    constructor(private readonly expandedPaths: ReadonlySet<string>) {}

    isOpen(node: LeveledNode): boolean {
        return node.children.length > 0 && this.expandedPaths.has(node.path)
    }

    sizeOf(node: LeveledNode): Size {
        if (this.isOpen(node)) {
            return this.planOf(node)
        }
        return node.kind === "declaration"
            ? { width: LAYOUT_SPACING.declarationWidth, height: LAYOUT_SPACING.declarationHeight }
            : { width: LAYOUT_SPACING.nodeWidth, height: LAYOUT_SPACING.nodeHeight }
    }

    planOf(container: LeveledNode): ContainerPlan {
        let plan = this.plans.get(container.path)
        if (!plan) {
            plan = this.planContainer(container)
            this.plans.set(container.path, plan)
        }
        return plan
    }

    private planContainer(container: LeveledNode): ContainerPlan {
        const isFile = container.kind === "file"
        const isLeveled = !isFile || this.stacksSeveralLevels(container)
        const fileSpacing = isLeveled ? LEVELED_FILE_CONTENT : DECLARATION_CONTENT
        const spacing = isFile ? fileSpacing : FOLDER_CONTENT
        const groups = groupByLevelFromTop(container.children)
        const candidates = rowWidthCandidates(groups, node => this.sizeOf(node).width, spacing)
        const widthOfAClosedFileInside = LAYOUT_SPACING.nodeWidth - 2 * LAYOUT_SPACING.padding
        const minInnerWidth = isFile ? widthOfAClosedFileInside : 0
        const planFor = (maxRowWidth: number) => ({ ...this.packRows(groups, maxRowWidth, spacing, minInnerWidth), isLeveled })
        return chooseClosestToTargetAspect(candidates, planFor)
    }

    /** A file whose declarations all share one level has no levels to tell apart. */
    private stacksSeveralLevels(file: LeveledNode): boolean {
        return new Set(file.children.map(declaration => declaration.level)).size > 1
    }

    private packRows(
        groups: LeveledNode[][],
        maxRowWidth: number,
        spacing: ContentSpacing,
        minInnerWidth: number
    ): Omit<ContainerPlan, "isLeveled"> {
        const rows = groups.flatMap((groupNodes, group) => this.wrapGroup(groupNodes, group, maxRowWidth, spacing))
        const innerWidth = Math.max(minInnerWidth, maxOf(rows.map(row => row.width)))
        const innerHeight = rows.reduce(
            (height, row, index) => height + row.height + (index === 0 ? 0 : gapAbove(row, rows[index - 1], spacing)),
            0
        )
        return {
            rows,
            innerWidth,
            spacing,
            width: innerWidth + 2 * LAYOUT_SPACING.padding,
            height: LAYOUT_SPACING.headerHeight + innerHeight + 2 * LAYOUT_SPACING.padding
        }
    }

    private wrapGroup(groupNodes: LeveledNode[], group: number, maxRowWidth: number, spacing: ContentSpacing): Row[] {
        const rows: Row[] = []
        let current: Row | null = null
        for (const node of groupNodes) {
            const size = this.sizeOf(node)
            const widthWithNode = current ? current.width + spacing.gapBetweenNodes + size.width : size.width
            if (current && widthWithNode <= maxRowWidth) {
                current.nodes.push(node)
                current.width = widthWithNode
                current.height = Math.max(current.height, size.height)
            } else {
                current = { group, level: node.level, nodes: [node], width: size.width, height: size.height }
                rows.push(current)
            }
        }
        return rows
    }
}

function groupByLevelFromTop(nodes: LeveledNode[]): LeveledNode[][] {
    const byLevel = new Map<number, LeveledNode[]>()
    for (const node of nodes) {
        addToGroup(byLevel, node.level, node)
    }
    return [...byLevel.entries()].sort(([levelA], [levelB]) => levelB - levelA).map(([, levelNodes]) => sortedByName(levelNodes))
}

function sortedByName(nodes: LeveledNode[]): LeveledNode[] {
    return nodes.toSorted((nodeA, nodeB) => nodeA.name.localeCompare(nodeB.name))
}

/** Every width at which some group would break into a new row. Between two of them the packing does not
 * change, so these are the only widths worth trying. */
function rowWidthCandidates(groups: LeveledNode[][], widthOf: (node: LeveledNode) => number, spacing: ContentSpacing): number[] {
    const rowWidthsPerGroup = groups.map(groupNodes => cumulativeRowWidths(groupNodes.map(widthOf), spacing.gapBetweenNodes))
    const widestSingleRow = maxOf(rowWidthsPerGroup.map(rowWidths => rowWidths.at(-1)))
    const widestNode = maxOf(groups.flat().map(widthOf))
    const narrowest = Math.max(widestNode, Math.min(spacing.unwrappedRowWidth, widestSingleRow))
    const candidates = new Set([narrowest, ...rowWidthsPerGroup.flat().filter(rowWidth => rowWidth > narrowest)])
    return [...candidates].sort((widthA, widthB) => widthA - widthB)
}

function cumulativeRowWidths(nodeWidths: number[], gapBetweenNodes: number): number[] {
    let rowWidth = -gapBetweenNodes
    return nodeWidths.map(nodeWidth => (rowWidth += gapBetweenNodes + nodeWidth))
}

/** A wider row limit never makes a folder taller, so its aspect ratio only grows with the limit, and a
 * binary search finds the two candidates around the target. */
function chooseClosestToTargetAspect(candidates: number[], planFor: (maxRowWidth: number) => ContainerPlan): ContainerPlan {
    const planAt = plannedOnce(index => planFor(candidates[index]))
    let low = 0
    let high = candidates.length - 1
    while (low < high) {
        const middle = Math.floor((low + high) / 2)
        if (aspectOf(planAt(middle)) < TARGET_ASPECT_RATIO) {
            low = middle + 1
        } else {
            high = middle
        }
    }
    const reaching = planAt(low)
    if (low === 0) {
        return reaching
    }
    const falling = planAt(low - 1)
    return distanceToTarget(falling) < distanceToTarget(reaching) ? falling : reaching
}

function plannedOnce(planAt: (candidateIndex: number) => ContainerPlan): (candidateIndex: number) => ContainerPlan {
    const plans = new Map<number, ContainerPlan>()
    return candidateIndex => {
        if (!plans.has(candidateIndex)) {
            plans.set(candidateIndex, planAt(candidateIndex))
        }
        return plans.get(candidateIndex)
    }
}

function aspectOf({ width, height }: Size): number {
    return width / height
}

function distanceToTarget(size: Size): number {
    return Math.abs(Math.log(aspectOf(size) / TARGET_ASPECT_RATIO))
}

export function gapAbove(row: Row, previous: Row, spacing: ContentSpacing): number {
    return row.group === previous.group ? spacing.gapBetweenRows : spacing.gapBetweenGroups
}
