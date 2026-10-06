import { DependencyEdgeType, LineStyleMeaning } from "../../../model/dependencyGraph.model"
import { GraphEdge } from "./edgeProjection"

export type ArrowHead = "filled" | "hollow" | "open" | "dot"

export interface LineStyle {
    dash: number[] | null
    head: ArrowHead
}

export interface UsageLegendEntry extends LineStyle {
    usage: string
    label: string
}

const EDGE_TYPE_DASH = [5, 4]
const DASHED = [7, 4]
const DOTTED = [2, 4]
const DASH_DOTTED = [9, 3, 2, 3]

export const PLAIN_LINE: LineStyle = { dash: null, head: "filled" }

/** The strongest tie first: an edge used in several ways shows the first of them it carries. Inheritance and
 * implementation are drawn as in a class diagram. */
export const USAGE_LEGEND: readonly UsageLegendEntry[] = [
    { usage: "inheritance", label: "Inherits from", dash: null, head: "hollow" },
    { usage: "implementation", label: "Implements", dash: DASHED, head: "hollow" },
    { usage: "instantiation", label: "Creates", dash: DASHED, head: "open" },
    { usage: "argument", label: "Takes as argument", dash: DOTTED, head: "open" },
    { usage: "return_value", label: "Returns", dash: DASH_DOTTED, head: "filled" },
    { usage: "constant_access", label: "Reads a constant of", dash: null, head: "dot" },
    { usage: "usage", label: "Uses", ...PLAIN_LINE }
]

const DASHED_EDGE_TYPE: DependencyEdgeType = "feedbackContainerLevel"

export function isDashedEdgeType(type: DependencyEdgeType, lineStyleShows: LineStyleMeaning): boolean {
    return lineStyleShows === "edgeType" && type === DASHED_EDGE_TYPE
}

export function lineStyleOf(edge: GraphEdge, lineStyleShows: LineStyleMeaning): LineStyle {
    if (lineStyleShows === "edgeType") {
        return isDashedEdgeType(edge.type, lineStyleShows) ? { dash: EDGE_TYPE_DASH, head: "filled" } : PLAIN_LINE
    }
    return USAGE_LEGEND.find(entry => entry.usage === usageShownBy(edge)) ?? PLAIN_LINE
}

export function lineStyleOfUsages(usages: readonly string[]): LineStyle {
    return USAGE_LEGEND.find(entry => usages.includes(entry.usage)) ?? PLAIN_LINE
}

/** Only an edge standing for a single dependency between two declarations has one kind of use to show; a
 * bundle of them stays a plain line. */
function usageShownBy(edge: GraphEdge): string | null {
    const [only, ...others] = edge.declarationEdges
    return only === undefined || others.length > 0 ? null : (usagesOf(edge)[0] ?? null)
}

/** Every way the edge's declarations use each other, the strongest tie first, the ones no legend names last. */
export function usagesOf(edge: GraphEdge): string[] {
    const carried = new Set(edge.declarationEdges.flatMap(declarationEdge => declarationEdge.usage))
    const known = USAGE_LEGEND.map(entry => entry.usage).filter(usage => carried.delete(usage))
    return [...known, ...[...carried].sort((usageA, usageB) => usageA.localeCompare(usageB))]
}

export function usageLabelOf(usage: string): string {
    return USAGE_LEGEND.find(entry => entry.usage === usage)?.label ?? usage.replaceAll("_", " ")
}
