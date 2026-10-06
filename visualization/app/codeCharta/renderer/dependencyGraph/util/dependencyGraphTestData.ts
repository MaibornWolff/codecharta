import { defaultDependencyGraphSettings } from "../../../stores/preferences/preferences.read.facade"
import { NO_CYCLE_MARKS } from "./cycleMarks"
import { GraphEdge } from "./edgeProjection"
import { LayoutBox, LevelBand } from "./layoutModel"

export const EDGE_COLORS = defaultDependencyGraphSettings.edgeColors

export const DEFAULT_LOOKS = {
    edgeColors: EDGE_COLORS,
    lineStyleShows: "edgeType",
    declarationKindMark: "icon",
    declarationArrangement: "stacked",
    cycleMarks: NO_CYCLE_MARKS,
    selectedEdgeId: null,
    highlightedEdgeIds: new Set<string>()
} as const

export function aBox(path: string, overrides: Partial<LayoutBox> = {}): LayoutBox {
    return {
        path,
        parentPath: path.slice(0, path.lastIndexOf("/")) || null,
        name: path.split("/").pop(),
        kind: "file",
        isExpanded: false,
        level: 0,
        levelPath: [0],
        depth: 1,
        x: 0,
        y: 0,
        width: 160,
        height: 40,
        ...overrides
    }
}

export function anEdge(fromPath: string, toPath: string, overrides: Partial<GraphEdge> = {}): GraphEdge {
    return { id: `${fromPath}|${toPath}`, fromPath, toPath, weight: 1, type: "regular", declarationEdges: [], ...overrides }
}

export function aBand(overrides: Partial<LevelBand> = {}): LevelBand {
    return {
        containerPath: "/root",
        level: 1,
        levelPath: [1],
        isTopmost: false,
        memberPaths: [],
        x: 0,
        y: 100,
        width: 400,
        height: 40,
        ...overrides
    }
}

export const identityPixels = ([x, y]: [number, number]) => [x, y]
