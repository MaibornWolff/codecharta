import { DeclarationArrangement } from "../../../model/dependencyGraph.model"
import { ContainerMeasurer, ContentSpacing, gapAbove, Row } from "./containerPlan"
import { Rectangle } from "./geometry"
import { DependencyGraphLayout, LAYOUT_SPACING, LayoutBox, LevelBand } from "./layoutModel"
import { LeveledNode } from "./leveledTree"

export interface LayoutOptions {
    /** The levels above the tree's root, when the tree is a focused folder of a larger one. */
    levelPathOfTree: number[]
    declarationArrangement: DeclarationArrangement
}

export function layoutLevelized(
    tree: LeveledNode,
    expandedPaths: ReadonlySet<string>,
    { levelPathOfTree, declarationArrangement }: LayoutOptions
): DependencyGraphLayout {
    const measurer = new ContainerMeasurer(expandedPaths, declarationArrangement)
    const rootSize = measurer.sizeOf(tree)
    const layout: DependencyGraphLayout = { boxes: [], bands: [], width: rootSize.width, height: rootSize.height }
    new LayoutPlacer(measurer, layout, new Map([[tree.path, levelPathOfTree]])).place(tree, { x: 0, y: 0 }, 0, null)
    return layout
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
        const { rows, innerWidth, width, spacing, isLeveled } = this.measurer.planOf(container)
        let rowTop = top
        let band: LevelBand | null = null
        rows.forEach((row, index) => {
            const previous = rows[index - 1]
            if (previous) {
                rowTop += gapAbove(row, previous, spacing)
            }
            if (isLeveled) {
                band = this.bandReaching({ row, previous, current: band }, container, { x, y: rowTop, width, height: 0 })
            }
            const left = x + LAYOUT_SPACING.padding + (innerWidth - row.width) / 2
            this.placeRow(row, { x: left, y: rowTop }, { parentPath: container.path, childDepth, band, spacing })
            rowTop += row.height
        })
    }

    /** A level's rows share one band, which a row of the next level ends. */
    private bandReaching({ row, previous, current }: BandRows, container: LeveledNode, rectangle: Rectangle) {
        let band = current
        if (band === null || previous?.level !== row.level) {
            // The levels inside a file are those of its declarations' packages, which the levels around the file say nothing of.
            const levelsAround = container.kind === "file" ? [] : this.levelPaths.get(container.path)
            const levelPath = [...levelsAround, row.level]
            band = { containerPath: container.path, level: row.level, levelPath, isTopmost: !previous, memberPaths: [], ...rectangle }
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
            }
            if (band && child.kind !== "declaration") {
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

interface BandRows {
    row: Row
    previous: Row | undefined
    current: LevelBand | null
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
