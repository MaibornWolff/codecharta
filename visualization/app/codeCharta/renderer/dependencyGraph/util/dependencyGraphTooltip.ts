import { escapeHtml } from "../../../util/escapeHtml"
import { EDGE_TYPE_LABELS } from "./dependencyGraphStyle"
import { GraphEdge } from "./edgeProjection"
import { LayoutBox } from "./levelizedLayout"
import { GraphItem } from "./paintOrder"

interface TooltipParams {
    dataIndex: number
}

export function buildTooltipFormatter(items: GraphItem[], byPath: ReadonlyMap<string, LayoutBox>) {
    return ({ dataIndex }: TooltipParams): string => {
        const item = items[dataIndex]
        switch (item?.kind) {
            case "box":
                return describeBox(item.box)
            case "edge":
                return describeEdge(item.edge, byPath)
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
