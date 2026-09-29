import { DependencyEdgeThickness, DependencyEdgeWidth } from "../../../model/dependencyGraph.model"

export type EdgeThickness = DependencyEdgeThickness
export type EdgeWidth = DependencyEdgeWidth

export const DEFAULT_EDGE_WIDTH: EdgeWidth = { thickness: "byCount", factor: 1 }

const BASE_WIDTH_PX = 1.2
const HAIRLINE_WIDTH_PX = 0.6
const UNIFORM_WIDTH_PX = 1.6

/** How fast and how far an edge grows with the dependencies it stands for; slowly, so one heavy edge does not
 * drown the rest. */
const GROWTH_BY_COUNT = { perDoublingPx: 0.5, maxExtraPx: 2.5 }
const STRONG_GROWTH = { perDoublingPx: 1, maxExtraPx: 5 }

export function edgeWidthPx(weight: number, { thickness, factor }: EdgeWidth): number {
    return roundedPx(unscaledWidthPx(weight, thickness) * factor)
}

function unscaledWidthPx(weight: number, thickness: EdgeThickness): number {
    switch (thickness) {
        case "thin":
            return HAIRLINE_WIDTH_PX
        case "uniform":
            return UNIFORM_WIDTH_PX
        case "strong":
            return grownWidthPx(weight, STRONG_GROWTH)
        default:
            return grownWidthPx(weight, GROWTH_BY_COUNT)
    }
}

function grownWidthPx(weight: number, { perDoublingPx, maxExtraPx }: typeof GROWTH_BY_COUNT): number {
    return BASE_WIDTH_PX + Math.min(maxExtraPx, Math.log2(weight) * perDoublingPx)
}

function roundedPx(widthPx: number): number {
    return Math.round(widthPx * 100) / 100
}
