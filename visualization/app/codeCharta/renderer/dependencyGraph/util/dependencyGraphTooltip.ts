import { isDependencyEdgeMetric } from "../../../lenses/dependency/dependencyLens.facade"
import { escapeHtml } from "../../../util/escapeHtml"
import { EDGE_TYPE_LABELS } from "./dependencyGraphStyle"
import { GraphEdge } from "./edgeProjection"
import { describeLevelPath, LayoutBox } from "./levelizedLayout"
import { GraphItem } from "./paintOrder"

interface TooltipParams {
    dataIndex: number
}

export function buildTooltipFormatter(items: GraphItem[], byPath: ReadonlyMap<string, LayoutBox>, edgeMetric: string | null) {
    return ({ dataIndex }: TooltipParams): string => {
        const item = items[dataIndex]
        switch (item?.kind) {
            case "box":
                return describeBox(item.box)
            case "edge":
                return describeEdge(item.edge, byPath, edgeMetric)
            default:
                return ""
        }
    }
}

function describeBox(box: LayoutBox): string {
    const rows = [`<b>${escapeHtml(box.path)}</b>`]
    if (box.levelPath.length > 0) {
        rows.push(`Level ${describeLevelPath(box.levelPath)}`)
    }
    if (box.isFolder) {
        rows.push(`<i>Double-click to ${box.isExpanded ? "close" : "open"}</i>`)
    }
    return rows.join("<br/>")
}

function describeEdge(edge: GraphEdge, boxesByPath: ReadonlyMap<string, LayoutBox>, edgeMetric: string | null): string {
    const fromName = boxesByPath.get(edge.fromPath).name
    const toName = boxesByPath.get(edge.toPath).name
    const title = `<b>${escapeHtml(fromName)} → ${escapeHtml(toName)}</b>`
    if (!isDependencyEdgeMetric(edgeMetric)) {
        return [title, `${escapeHtml(edgeMetric ?? "")} ${roundedForReading(edge.weight)}`].join("<br/>")
    }
    const count = `${edge.weight} ${edge.weight === 1 ? "dependency" : "dependencies"}`
    return [title, `${count} · ${EDGE_TYPE_LABELS[edge.type]}`].join("<br/>")
}

const READABLE_DECIMALS = 1000

function roundedForReading(value: number): number {
    return Math.round(value * READABLE_DECIMALS) / READABLE_DECIMALS
}
