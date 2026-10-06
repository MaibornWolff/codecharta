import { addToGroup, maxOf } from "./collections"
import { Rectangle } from "./geometry"
import { BoxKind, LeveledNode } from "./leveledTree"

export interface LayoutBox extends Rectangle {
    path: string
    name: string
    kind: BoxKind
    isExpanded: boolean
    level: number
    /** The levels it is named by: those of the boxes around it, outermost first, then its own. */
    levelPath: number[]
    depth: number
}

export interface LevelBand extends Rectangle {
    folderPath: string
    level: number
    levelPath: number[]
    isTopmost: boolean
    /** The band spans them once the reader drags them around. */
    memberPaths: string[]
}

export interface DependencyGraphLayout {
    /** Parents before their children, which is the order they are painted in. */
    boxes: LayoutBox[]
    bands: LevelBand[]
    width: number
    height: number
}

export function namedByOwnLevel(layout: DependencyGraphLayout): DependencyGraphLayout {
    const ownLevelOnly = <Item extends { levelPath: number[] }>(item: Item): Item => ({ ...item, levelPath: item.levelPath.slice(-1) })
    return { ...layout, boxes: layout.boxes.map(ownLevelOnly), bands: layout.bands.map(ownLevelOnly) }
}

export function describeLevelPath(levelPath: number[]): string {
    return levelPath.join(".")
}

export const LAYOUT_SPACING = {
    nodeWidth: 160,
    nodeHeight: 40,
    padding: 12,
    headerHeight: 28,
    gapBetweenNodes: 20,
    gapBetweenRows: 14,
    gapBetweenLevels: 36
} as const

/** The shape every open folder aims for, close to a screen, so neither a long level nor a deep stack
 * of levels stretches it into a strip. */
const TARGET_ASPECT_RATIO = 16 / 10

/** A node box is four times as wide as it is tall, so the aspect ratio alone would stack even a handful
 * of files into a column. A row of six still fits a laptop screen at full size. */
const MIN_NODES_PER_ROW = 6

interface Size {
    width: number
    height: number
}

interface Row {
    level: number
    nodes: LeveledNode[]
    width: number
    height: number
}

interface FolderPlan extends Size {
    rows: Row[]
    innerWidth: number
}

export function layoutLevelized(
    tree: LeveledNode,
    expandedPaths: ReadonlySet<string>,
    levelPathOfTree: number[] = []
): DependencyGraphLayout {
    const measurer = new FolderMeasurer(expandedPaths)
    const rootSize = measurer.sizeOf(tree)
    const layout: DependencyGraphLayout = { boxes: [], bands: [], width: rootSize.width, height: rootSize.height }
    new LayoutPlacer(measurer, layout, new Map([[tree.path, levelPathOfTree]])).place(tree, 0, 0, 0)
    return layout
}

class FolderMeasurer {
    private readonly plans = new Map<string, FolderPlan>()

    constructor(private readonly expandedPaths: ReadonlySet<string>) {}

    isOpen(node: LeveledNode): boolean {
        return node.kind === "folder" && this.expandedPaths.has(node.path)
    }

    sizeOf(node: LeveledNode): Size {
        return this.isOpen(node) ? this.planOf(node) : { width: LAYOUT_SPACING.nodeWidth, height: LAYOUT_SPACING.nodeHeight }
    }

    planOf(folder: LeveledNode): FolderPlan {
        let plan = this.plans.get(folder.path)
        if (!plan) {
            plan = this.planFolder(folder)
            this.plans.set(folder.path, plan)
        }
        return plan
    }

    private planFolder(folder: LeveledNode): FolderPlan {
        const levels = groupByLevelFromTop(folder.children)
        const candidates = rowWidthCandidates(levels, node => this.sizeOf(node).width)
        const planFor = (maxRowWidth: number) => this.packRows(levels, maxRowWidth)
        return chooseClosestToTargetAspect(candidates, planFor)
    }

    private packRows(levels: LeveledNode[][], maxRowWidth: number): FolderPlan {
        const rows = levels.flatMap(levelNodes => this.wrapLevel(levelNodes, maxRowWidth))
        const innerWidth = maxOf(rows.map(row => row.width))
        const innerHeight = rows.reduce((height, row, index) => height + row.height + (index === 0 ? 0 : gapAbove(row, rows[index - 1])), 0)
        return {
            rows,
            innerWidth,
            width: innerWidth + 2 * LAYOUT_SPACING.padding,
            height: LAYOUT_SPACING.headerHeight + innerHeight + 2 * LAYOUT_SPACING.padding
        }
    }

    private wrapLevel(levelNodes: LeveledNode[], maxRowWidth: number): Row[] {
        const rows: Row[] = []
        let current: Row | null = null
        for (const node of levelNodes) {
            const size = this.sizeOf(node)
            const widthWithNode = current ? current.width + LAYOUT_SPACING.gapBetweenNodes + size.width : size.width
            if (current && widthWithNode <= maxRowWidth) {
                current.nodes.push(node)
                current.width = widthWithNode
                current.height = Math.max(current.height, size.height)
            } else {
                current = { level: node.level, nodes: [node], width: size.width, height: size.height }
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
    return [...byLevel.entries()]
        .sort(([levelA], [levelB]) => levelB - levelA)
        .map(([, levelNodes]) => levelNodes.toSorted((nodeA, nodeB) => nodeA.name.localeCompare(nodeB.name)))
}

/** Every width at which some level would break into a new row. Between two of them the packing does not
 * change, so these are the only widths worth trying. */
function rowWidthCandidates(levels: LeveledNode[][], widthOf: (node: LeveledNode) => number): number[] {
    const rowWidthsPerLevel = levels.map(levelNodes => cumulativeRowWidths(levelNodes.map(widthOf)))
    const widestSingleRow = maxOf(rowWidthsPerLevel.map(rowWidths => rowWidths.at(-1)))
    const widestNode = maxOf(levels.flat().map(widthOf))
    const narrowest = Math.max(widestNode, Math.min(rowWidthOf(MIN_NODES_PER_ROW), widestSingleRow))
    const candidates = new Set([narrowest, ...rowWidthsPerLevel.flat().filter(rowWidth => rowWidth > narrowest)])
    return [...candidates].sort((widthA, widthB) => widthA - widthB)
}

function cumulativeRowWidths(nodeWidths: number[]): number[] {
    let rowWidth = -LAYOUT_SPACING.gapBetweenNodes
    return nodeWidths.map(nodeWidth => (rowWidth += LAYOUT_SPACING.gapBetweenNodes + nodeWidth))
}

function rowWidthOf(nodeCount: number): number {
    return nodeCount * LAYOUT_SPACING.nodeWidth + (nodeCount - 1) * LAYOUT_SPACING.gapBetweenNodes
}

/** A wider row limit never makes a folder taller, so its aspect ratio only grows with the limit, and a
 * binary search finds the two candidates around the target. */
function chooseClosestToTargetAspect(candidates: number[], planFor: (maxRowWidth: number) => FolderPlan): FolderPlan {
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

function plannedOnce(planAt: (candidateIndex: number) => FolderPlan): (candidateIndex: number) => FolderPlan {
    const plans = new Map<number, FolderPlan>()
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

function gapAbove(row: Row, previous: Row): number {
    return row.level === previous.level ? LAYOUT_SPACING.gapBetweenRows : LAYOUT_SPACING.gapBetweenLevels
}

class LayoutPlacer {
    constructor(
        private readonly measurer: FolderMeasurer,
        private readonly layout: DependencyGraphLayout,
        private readonly levelPaths: Map<string, number[]>
    ) {}

    place(node: LeveledNode, x: number, y: number, depth: number) {
        const isExpanded = this.measurer.isOpen(node)
        const size = this.measurer.sizeOf(node)
        this.layout.boxes.push({
            path: node.path,
            name: node.name,
            kind: node.kind,
            isExpanded,
            level: node.level,
            levelPath: this.levelPaths.get(node.path),
            depth,
            x,
            y,
            ...size
        })
        if (isExpanded) {
            this.placeRows(node, x, y + LAYOUT_SPACING.headerHeight + LAYOUT_SPACING.padding, depth + 1)
        }
    }

    private placeRows(folder: LeveledNode, x: number, top: number, childDepth: number) {
        const { rows, innerWidth, width } = this.measurer.planOf(folder)
        let rowTop = top
        let band: LevelBand
        rows.forEach((row, index) => {
            const previous = rows[index - 1]
            if (previous) {
                rowTop += gapAbove(row, previous)
            }
            if (previous?.level !== row.level) {
                band = this.startBand(folder, row.level, { x, y: rowTop, width, height: 0 })
                band.isTopmost = !previous
                this.layout.bands.push(band)
            }
            band.height = rowTop + row.height - band.y
            let nodeLeft = x + LAYOUT_SPACING.padding + (innerWidth - row.width) / 2
            for (const child of row.nodes) {
                band.memberPaths.push(child.path)
                this.levelPaths.set(child.path, band.levelPath)
                this.place(child, nodeLeft, rowTop, childDepth)
                nodeLeft += this.measurer.sizeOf(child).width + LAYOUT_SPACING.gapBetweenNodes
            }
            rowTop += row.height
        })
    }

    private startBand(folder: LeveledNode, level: number, rectangle: Rectangle): LevelBand {
        const levelPath = [...this.levelPaths.get(folder.path), level]
        return { folderPath: folder.path, level, levelPath, isTopmost: false, memberPaths: [], ...rectangle }
    }
}
