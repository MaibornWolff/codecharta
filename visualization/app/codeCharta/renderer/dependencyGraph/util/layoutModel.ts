import { Rectangle } from "./geometry"
import { BoxKind } from "./leveledTree"

export interface LayoutBox extends Rectangle {
    path: string
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
    containerPath: string
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

/** A folder or package opens into what it holds, and so does a file once the map tells its declarations. */
export function canBeOpened(box: LayoutBox): boolean {
    return isContainerKind(box.kind) || (box.kind === "file" && box.declarationCount > 0)
}

export function isContainerKind(kind: BoxKind): boolean {
    return kind === "folder" || kind === "package"
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
