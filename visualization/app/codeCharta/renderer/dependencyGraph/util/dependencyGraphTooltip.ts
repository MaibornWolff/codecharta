import { escapeHtml } from "../../../util/escapeHtml"
import { SERIES_IDS } from "./dependencyGraphSeries"
import { EDGE_TYPE_LABELS } from "./dependencyGraphStyle"
import { GraphEdge } from "./edgeProjection"
import { LayoutBox } from "./levelizedLayout"

interface TooltipParams {
    seriesId?: string
    dataIndex: number
}

interface TooltipSources {
    openFolders: LayoutBox[]
    closedBoxes: LayoutBox[]
    shownEdges: GraphEdge[]
    byPath: ReadonlyMap<string, LayoutBox>
}

export function buildTooltipFormatter({ openFolders, closedBoxes, shownEdges, byPath }: TooltipSources) {
    return ({ seriesId, dataIndex }: TooltipParams): string => {
        switch (seriesId) {
            case SERIES_IDS.edges:
                return describeEdge(shownEdges[dataIndex], byPath)
            case SERIES_IDS.openFolders:
                return describeBox(openFolders[dataIndex])
            case SERIES_IDS.boxes:
                return describeBox(closedBoxes[dataIndex])
            default:
                return ""
        }
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
