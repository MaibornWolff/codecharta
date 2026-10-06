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

type TooltipSettings = Pick<DependencyGraphScene, "edgeMetric" | "lineStyleShows" | "cycleMarks" | "movedPaths" | "movedEdgeIds">

const MOVED_BOX_NOTE = "Sits elsewhere among the folders and the packages"
const MOVED_EDGE_NOTE = "Of another type among the folders than among the packages"

export function buildTooltipFormatter(items: GraphItem[], byPath: ReadonlyMap<string, LayoutBox>, settings: TooltipSettings) {
    return ({ dataIndex }: TooltipParams): string => {
        const item = items[dataIndex]
        switch (item?.kind) {
            case "box":
                return [
                    describeBox(item.box, settings.cycleMarks),
                    ...(settings.movedPaths.has(item.box.path) ? [MOVED_BOX_NOTE] : [])
                ].join("<br/>")
            case "edge":
                return [
                    describeEdge(item.edge, byPath, settings),
                    ...(settings.movedEdgeIds.has(item.edge.id) ? [MOVED_EDGE_NOTE] : [])
                ].join("<br/>")
            default:
                return ""
        }
    }
}

function describeBox(box: LayoutBox, { hiddenCyclicEdges, declarationsInCycles }: CycleMarks): string {
    if (box.kind === "declaration") {
        const rows = [`<b>${escapeHtml(box.name)}</b>`, escapeHtml(box.declarationKind ?? "")]
        return [...rows, ...(declarationsInCycles.has(box.path) ? ["Takes part in a cycle"] : [])].join("<br/>")
    }
    const title = isPackagePath(box.path) ? `Package ${packageKeyOf(box.path)}` : box.path
    const rows = [`<b>${escapeHtml(title)}</b>`]
    if (box.levelPath.length > 0) {
        rows.push(`Level ${describeLevelPath(box.levelPath)}`)
    }
    const hiddenCount = box.isExpanded ? 0 : (hiddenCyclicEdges.get(box.path) ?? 0)
    if (hiddenCount > 0) {
        rows.push(`Hides ${hiddenCount} cyclic ${hiddenCount === 1 ? "dependency" : "dependencies"} between declarations`)
    }
    if (canBeOpened(box)) {
        rows.push(`<i>Double-click to ${box.isExpanded ? "close" : "open"}</i>`)
    }
    return rows.join("<br/>")
}

function describeEdge(
    edge: GraphEdge,
    boxesByPath: ReadonlyMap<string, LayoutBox>,
    { edgeMetric, lineStyleShows }: TooltipSettings
): string {
    const fromName = boxesByPath.get(edge.fromPath).name
    const toName = boxesByPath.get(edge.toPath).name
    const title = `<b>${escapeHtml(fromName)} → ${escapeHtml(toName)}</b>`
    if (!isDependencyEdgeMetric(edgeMetric)) {
        return [title, `${escapeHtml(edgeMetric ?? "")} ${roundedForReading(edge.weight)}`].join("<br/>")
    }
    const count = `${edge.weight} ${edge.weight === 1 ? "dependency" : "dependencies"}`
    const usages = lineStyleShows === "usage" ? usagesOf(edge).map(usageLabelOf).map(escapeHtml) : []
    return [title, `${count} · ${EDGE_TYPE_LABELS[edge.type]}`, ...(usages.length > 0 ? [usages.join(", ")] : [])].join("<br/>")
}

const READABLE_DECIMALS = 1000

function roundedForReading(value: number): number {
    return Math.round(value * READABLE_DECIMALS) / READABLE_DECIMALS
}
