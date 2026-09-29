import { escapeHtml } from "../../../util/escapeHtml"
import { SERIES_IDS } from "./dependencyGraphSeries"
import { EDGE_TYPE_LABELS } from "./dependencyGraphStyle"
import { GraphEdge } from "./edgeProjection"
import { LayoutBox } from "./levelizedLayout"
import { PaintedItem } from "./paintOrder"

interface TooltipParams {
    seriesId?: string
    dataIndex: number
}

interface TooltipSources {
    painted: PaintedItem[]
    shownEdges: GraphEdge[]
    byPath: ReadonlyMap<string, LayoutBox>
}

export function buildTooltipFormatter({ painted, shownEdges, byPath }: TooltipSources) {
    return ({ seriesId, dataIndex }: TooltipParams): string => {
        if (seriesId === SERIES_IDS.edges) {
            return describeEdge(shownEdges[dataIndex], byPath)
        }
        const item = painted[dataIndex]
        return seriesId === SERIES_IDS.boxes && item.kind === "box" ? describeBox(item.box) : ""
    }
}

function describeBox(box: LayoutBox): string {
    const rows = [`<b>${escapeHtml(box.path)}</b>`, `Level ${box.level}`]
    if (box.isFolder) {
        rows.push(`<i>Double-click to ${box.isExpanded ? "close" : "open"}</i>`)
    }
    return rows.join("<br/>")
}

function describeEdge(edge: GraphEdge, boxesByPath: ReadonlyMap<string, LayoutBox>): string {
    const fromName = boxesByPath.get(edge.fromPath).name
    const toName = boxesByPath.get(edge.toPath).name
    const count = `${edge.weight} ${edge.weight === 1 ? "dependency" : "dependencies"}`
    return [`<b>${escapeHtml(fromName)} → ${escapeHtml(toName)}</b>`, `${count} · ${EDGE_TYPE_LABELS[edge.type]}`].join("<br/>")
}
