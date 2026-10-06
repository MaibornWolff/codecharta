import { DeclarationArrangement } from "../../../model/dependencyGraph.model"
import { addToGroup, maxOf } from "./collections"
import { Rectangle } from "./geometry"
import { BoxKind, LeveledNode } from "./leveledTree"

export interface LayoutBox extends Rectangle {
    path: string
    /** The box it lies in; null for the root. */
    parentPath: string | null
    name: string
    kind: BoxKind
    isExpanded: boolean
    level: number
    /** The levels it is named by: those of the boxes around it, outermost first, then its own. */
    levelPath: number[]
    depth: number
    declarationKind?: string
    /** How many declarations a file holds, whether it shows them or not. */
    declarationCount?: number
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

/** A folder opens into what it holds, and so does a file once the map tells its declarations. */
export function canBeOpened(box: LayoutBox): boolean {
    return box.kind === "folder" || (box.kind === "file" && box.declarationCount > 0)
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
    gapBetweenLevels: 36,
    declarationWidth: 132,
    declarationHeight: 26,
    chipHeight: 22
} as const

/** The shape every open folder aims for, close to a screen, so neither a long level nor a deep stack
 * of levels stretches it into a strip. */
const TARGET_ASPECT_RATIO = 16 / 10

/** A node box is four times as wide as it is tall, so the aspect ratio alone would stack even a handful
 * of files into a column. A row of six still fits a laptop screen at full size. */
const MIN_NODES_PER_ROW = 6
const MIN_DECLARATIONS_PER_ROW = 2

/** A chip is as wide as its name, estimated from its length since nothing is drawn yet. */
const CHIP_WIDTH = { perCharacter: 6.5, padding: 16, min: 44, max: 220 }

interface ContentSpacing {
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
const DECLARATION_LEVEL_GAP = 16
const UNWRAPPED_DECLARATION_ROW_WIDTH =
    MIN_DECLARATIONS_PER_ROW * LAYOUT_SPACING.declarationWidth + (MIN_DECLARATIONS_PER_ROW - 1) * DECLARATION_GAP

const FILE_CONTENT: Record<DeclarationArrangement, ContentSpacing> = {
    stacked: {
        gapBetweenNodes: DECLARATION_GAP,
        gapBetweenRows: DECLARATION_ROW_GAP,
        gapBetweenGroups: DECLARATION_LEVEL_GAP,
        unwrappedRowWidth: UNWRAPPED_DECLARATION_ROW_WIDTH
    },
    list: {
        gapBetweenNodes: DECLARATION_GAP,
        gapBetweenRows: DECLARATION_ROW_GAP,
        gapBetweenGroups: DECLARATION_ROW_GAP,
        unwrappedRowWidth: LAYOUT_SPACING.declarationWidth
    },
    chips: {
        gapBetweenNodes: DECLARATION_GAP,
        gapBetweenRows: DECLARATION_ROW_GAP,
        gapBetweenGroups: DECLARATION_ROW_GAP,
        unwrappedRowWidth: UNWRAPPED_DECLARATION_ROW_WIDTH
    }
}

interface Size {
    width: number
    height: number
}

interface Row {
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
}

export interface LayoutOptions {
    /** The levels above the tree's root, when the tree is a focused folder of a larger one. */
    levelPathOfTree?: number[]
    declarationArrangement?: DeclarationArrangement
}

export function layoutLevelized(
    tree: LeveledNode,
    expandedPaths: ReadonlySet<string>,
    { levelPathOfTree = [], declarationArrangement = "stacked" }: LayoutOptions = {}
): DependencyGraphLayout {
    const measurer = new ContainerMeasurer(expandedPaths, declarationArrangement)
    const rootSize = measurer.sizeOf(tree)
    const layout: DependencyGraphLayout = { boxes: [], bands: [], width: rootSize.width, height: rootSize.height }
    new LayoutPlacer(measurer, layout, new Map([[tree.path, levelPathOfTree]])).place(tree, { x: 0, y: 0 }, 0, null)
    return layout
}

class ContainerMeasurer {
    private readonly plans = new Map<string, ContainerPlan>()

    constructor(
        private readonly expandedPaths: ReadonlySet<string>,
        private readonly declarationArrangement: DeclarationArrangement
    ) {}

    isOpen(node: LeveledNode): boolean {
        return node.children.length > 0 && this.expandedPaths.has(node.path)
    }

    sizeOf(node: LeveledNode): Size {
        if (this.isOpen(node)) {
            return this.planOf(node)
        }
        return node.kind === "declaration"
            ? declarationSize(node, this.declarationArrangement)
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
        const spacing = isFile ? FILE_CONTENT[this.declarationArrangement] : FOLDER_CONTENT
        const groups = isFile ? groupDeclarations(container.children, this.declarationArrangement) : groupByLevelFromTop(container.children)
        const candidates = rowWidthCandidates(groups, node => this.sizeOf(node).width, spacing)
        const minInnerWidth = isFile ? LAYOUT_SPACING.nodeWidth - 2 * LAYOUT_SPACING.padding : 0
        const planFor = (maxRowWidth: number) => this.packRows(groups, maxRowWidth, spacing, minInnerWidth)
        return chooseClosestToTargetAspect(candidates, planFor)
    }

    private packRows(groups: LeveledNode[][], maxRowWidth: number, spacing: ContentSpacing, minInnerWidth: number): ContainerPlan {
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

function declarationSize(declaration: LeveledNode, arrangement: DeclarationArrangement): Size {
    if (arrangement !== "chips") {
        return { width: LAYOUT_SPACING.declarationWidth, height: LAYOUT_SPACING.declarationHeight }
    }
    const widthOfName = declaration.name.length * CHIP_WIDTH.perCharacter + CHIP_WIDTH.padding
    return { width: Math.min(CHIP_WIDTH.max, Math.max(CHIP_WIDTH.min, widthOfName)), height: LAYOUT_SPACING.chipHeight }
}

function groupDeclarations(declarations: LeveledNode[], arrangement: DeclarationArrangement): LeveledNode[][] {
    if (arrangement === "stacked") {
        return groupByLevelFromTop(declarations)
    }
    const byName = sortedByName(declarations)
    return arrangement === "list" ? byName.map(declaration => [declaration]) : [byName]
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

function gapAbove(row: Row, previous: Row, spacing: ContentSpacing): number {
    return row.group === previous.group ? spacing.gapBetweenRows : spacing.gapBetweenGroups
}

const NO_LEVEL_PATH: number[] = []

class LayoutPlacer {
    constructor(
        private readonly measurer: ContainerMeasurer,
        private readonly layout: DependencyGraphLayout,
        private readonly levelPaths: Map<string, number[]>
    ) {}

    place(node: LeveledNode, { x, y }: Position, depth: number, parentPath: string | null) {
        const isExpanded = this.measurer.isOpen(node)
        const size = this.measurer.sizeOf(node)
        this.layout.boxes.push({
            path: node.path,
            parentPath,
            name: node.name,
            kind: node.kind,
            isExpanded,
            level: node.level,
            levelPath: this.levelPaths.get(node.path) ?? NO_LEVEL_PATH,
            depth,
            ...declarationFactsOf(node),
            x,
            y,
            ...size
        })
        if (isExpanded) {
            this.placeRows(node, x, y + LAYOUT_SPACING.headerHeight + LAYOUT_SPACING.padding, depth + 1)
        }
    }

    private placeRows(container: LeveledNode, x: number, top: number, childDepth: number) {
        const { rows, innerWidth, width, spacing } = this.measurer.planOf(container)
        let rowTop = top
        let band: LevelBand | null = null
        rows.forEach((row, index) => {
            const previous = rows[index - 1]
            if (previous) {
                rowTop += gapAbove(row, previous, spacing)
            }
            if (container.kind !== "file") {
                band = this.bandReaching(row, previous, band, container, { x, y: rowTop, width, height: 0 })
            }
            const left = x + LAYOUT_SPACING.padding + (innerWidth - row.width) / 2
            this.placeRow(row, { x: left, y: rowTop }, { parentPath: container.path, childDepth, band, spacing })
            rowTop += row.height
        })
    }

    /** A level's rows share one band, which a row of the next level ends. */
    private bandReaching(row: Row, previous: Row | undefined, current: LevelBand | null, folder: LeveledNode, rectangle: Rectangle) {
        let band = current
        if (band === null || previous?.level !== row.level) {
            const levelPath = [...this.levelPaths.get(folder.path), row.level]
            band = { folderPath: folder.path, level: row.level, levelPath, isTopmost: !previous, memberPaths: [], ...rectangle }
            this.layout.bands.push(band)
        }
        band.height = rectangle.y + row.height - band.y
        return band
    }

    private placeRow(row: Row, { x, y }: Position, { parentPath, childDepth, band, spacing }: RowPlacement) {
        let nodeLeft = x
        for (const child of row.nodes) {
            if (band) {
                band.memberPaths.push(child.path)
                this.levelPaths.set(child.path, band.levelPath)
            }
            this.place(child, { x: nodeLeft, y }, childDepth, parentPath)
            nodeLeft += this.measurer.sizeOf(child).width + spacing.gapBetweenNodes
        }
    }
}

interface Position {
    x: number
    y: number
}

interface RowPlacement {
    parentPath: string
    childDepth: number
    band: LevelBand | null
    spacing: ContentSpacing
}

function declarationFactsOf(node: LeveledNode): Pick<LayoutBox, "declarationKind" | "declarationCount"> {
    if (node.kind === "file") {
        return { declarationCount: node.children.length }
    }
    return node.kind === "declaration" ? { declarationKind: node.declarationKind } : {}
}
