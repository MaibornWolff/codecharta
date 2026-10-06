import { isDependencyEdgeMetric } from "../../../lenses/dependency/dependencyLens.facade"
import { escapeHtml } from "../../../util/escapeHtml"
import { isPackagePath, packageKeyOf } from "./boxPaths"
import { CycleMarks } from "./cycleMarks"
import { DependencyGraphScene } from "./dependencyGraphScene"
import { EDGE_TYPE_LABELS } from "./dependencyGraphStyle"
import { GraphEdge } from "./edgeProjection"
import { canBeOpened, describeLevelPath, LayoutBox } from "./levelizedLayout"
import { usageLabelOf, usagesOf } from "./lineStyle"
import { GraphItem } from "./paintOrder"

interface TooltipParams {
    dataIndex: number
}

type TooltipSettings = Pick<DependencyGraphScene, "edgeMetric" | "cycleMarks">

export function buildTooltipFormatter(items: GraphItem[], byPath: ReadonlyMap<string, LayoutBox>, settings: TooltipSettings) {
    return ({ dataIndex }: TooltipParams): string => {
        const item = items[dataIndex]
        switch (item?.kind) {
            case "box":
                return describeBox(item.box, settings.cycleMarks)
            case "edge":
                return describeEdge(item.edge, byPath, settings)
            default:
                return ""
        }
    }
}

function describeBox(box: LayoutBox, { hiddenCycles, declarationsInCycles }: CycleMarks): string {
    if (box.kind === "declaration") {
        const rows = [`<b>${escapeHtml(box.name)}</b>`, escapeHtml(box.declarationKind ?? "")]
        return [...rows, ...(declarationsInCycles.has(box.path) ? ["Takes part in a cycle"] : [])].join("<br/>")
    }
    const title = isPackagePath(box.path) ? `Package ${packageKeyOf(box.path)}` : box.path
    const rows = [`<b>${escapeHtml(title)}</b>`]
    if (box.levelPath.length > 0) {
        rows.push(`Level ${describeLevelPath(box.levelPath)}`)
    }
    const hiddenCount = box.isExpanded ? 0 : (hiddenCycles.get(box.path) ?? 0)
    if (hiddenCount > 0) {
        rows.push(`${hiddenCount} ${hiddenCount === 1 ? "cycle" : "cycles"} inside`)
    }
    if (canBeOpened(box)) {
        rows.push(`<i>Double-click to ${box.isExpanded ? "close" : "open"}</i>`)
    }
    return rows.join("<br/>")
}

function describeEdge(edge: GraphEdge, boxesByPath: ReadonlyMap<string, LayoutBox>, { edgeMetric }: TooltipSettings): string {
    const fromName = boxesByPath.get(edge.fromPath).name
    const toName = boxesByPath.get(edge.toPath).name
    const title = `<b>${escapeHtml(fromName)} → ${escapeHtml(toName)}</b>`
    if (!isDependencyEdgeMetric(edgeMetric)) {
        return [title, `${escapeHtml(edgeMetric ?? "")} ${roundedForReading(edge.weight)}`].join("<br/>")
    }
    const type = EDGE_TYPE_LABELS[edge.type]
    const [only, ...others] = edge.declarationEdges
    if (only === undefined) {
        return [title, `${edge.weight} ${edge.weight === 1 ? "dependency" : "dependencies"} · ${type}`].join("<br/>")
    }
    if (others.length > 0) {
        return [title, `${edge.declarationEdges.length} declaration edges · ${type}`, "<i>Click to list them</i>"].join("<br/>")
    }
    const usages = usagesOf(edge).map(usageLabelOf).map(escapeHtml).join(", ")
    const declarations = `<b>${escapeHtml(only.fromLeaf)} → ${escapeHtml(only.toLeaf)}</b>`
    const isFolded = fromName !== only.fromLeaf || toName !== only.toLeaf
    const drawnAs = isFolded ? [`drawn as ${escapeHtml(fromName)} → ${escapeHtml(toName)}`] : []
    return [declarations, [usages, type].filter(Boolean).join(" · "), ...drawnAs].join("<br/>")
}

const READABLE_DECIMALS = 1000

function roundedForReading(value: number): number {
    return Math.round(value * READABLE_DECIMALS) / READABLE_DECIMALS
}
