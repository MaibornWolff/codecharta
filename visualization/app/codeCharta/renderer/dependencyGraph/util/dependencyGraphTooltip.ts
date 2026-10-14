import { isDependencyEdgeMetric } from "../../../lenses/dependency/dependencyLens.facade"
import { escapeHtml } from "../../../util/escapeHtml"
import { isPackagePath, nameOfPath } from "./boxPaths"
import { CycleMarks, DeclarationCycles } from "./cycleMarks"
import { DependencyGraphScene } from "./dependencyGraphScene"
import { EDGE_TYPE_LABELS } from "./dependencyGraphStyle"
import { GraphEdge } from "./edgeProjection"
import { canBeOpened, LayoutBox } from "./layoutModel"
import { usageLabelOf, usagesOf } from "./lineStyle"
import { GraphItem } from "./paintOrder"
import { counted } from "./wording"

interface TooltipParams {
    dataIndex: number
}

type TooltipSettings = Pick<DependencyGraphScene, "edgeMetric" | "cycleMarks" | "upwardMarks">

export function buildTooltipFormatter(items: GraphItem[], byPath: ReadonlyMap<string, LayoutBox>, settings: TooltipSettings) {
    return ({ dataIndex }: TooltipParams): string => {
        const item = items[dataIndex]
        switch (item?.kind) {
            case "box":
                return describeBox(item.box, settings)
            case "edge":
                return describeEdge(item.edge, byPath, settings)
            default:
                return ""
        }
    }
}

function describeBox(box: LayoutBox, { cycleMarks, upwardMarks }: TooltipSettings): string {
    if (box.kind === "declaration") {
        const rows = [`<b>${escapeHtml(box.name)}</b>`, escapeHtml(box.declarationKind ?? "")]
        return [...rows, ...describeCyclesOfDeclaration(cycleMarks.declarationsInCycles.get(box.path))].join("<br/>")
    }
    const title = isPackagePath(box.path) ? `Package ${box.name}` : nameOfPath(box.path)
    const rows = [`<b>${escapeHtml(title)}</b>`]
    if (box.isInLevelBand) {
        rows.push(`Level ${box.level}`)
    }
    rows.push(...describeCyclesOfBox(box, cycleMarks), ...describeUpwardOfBox(upwardMarks.get(box.path) ?? 0))
    if (canBeOpened(box)) {
        rows.push(`<i>Double-click to ${box.isExpanded ? "close" : "open"}</i>`)
    }
    return rows.join("<br/>")
}

function describeCyclesOfBox(box: LayoutBox, { cyclesInsideFiles, cyclesBetweenFiles }: CycleMarks): string[] {
    const insideFilesCount = cyclesInsideFiles.get(box.path) ?? 0
    const betweenFilesCount = cyclesBetweenFiles.get(box.path) ?? 0
    return [
        ...(betweenFilesCount > 0 ? [`${counted(betweenFilesCount, "cycle")} between files`] : []),
        ...(insideFilesCount > 0 ? [`${counted(insideFilesCount, "cycle")} inside ${box.kind === "file" ? "this file" : "files"}`] : [])
    ]
}

function describeUpwardOfBox(upwardCount: number): string[] {
    return upwardCount > 0 ? [`${counted(upwardCount, "upward dependency", "upward dependencies")} inside`] : []
}

function describeCyclesOfDeclaration(cycles: DeclarationCycles | undefined): string[] {
    return [
        ...(cycles?.isWithOtherFiles ? ["In a cycle with other files"] : []),
        ...(cycles?.isWithinItsFile ? ["In a cycle inside this file"] : [])
    ]
}

function describeEdge(edge: GraphEdge, boxesByPath: ReadonlyMap<string, LayoutBox>, { edgeMetric }: TooltipSettings): string {
    const from = boxesByPath.get(edge.fromPath)
    const to = boxesByPath.get(edge.toPath)
    const title = `<b>${escapeHtml(from.name)} → ${escapeHtml(to.name)}</b>`
    if (!isDependencyEdgeMetric(edgeMetric)) {
        return [title, `${escapeHtml(edgeMetric ?? "")} ${roundedForReading(edge.weight)}`].join("<br/>")
    }
    const type = EDGE_TYPE_LABELS[edge.type]
    const [only, ...others] = edge.declarationEdges
    if (only === undefined) {
        return [title, `${counted(edge.weight, "dependency", "dependencies")} · ${type}`].join("<br/>")
    }
    if (others.length > 0) {
        return [title, `${edge.declarationEdges.length} declaration edges · ${type}`, "<i>Click to list them</i>"].join("<br/>")
    }
    const usages = usagesOf(edge).map(usageLabelOf).map(escapeHtml).join(", ")
    const kindOfUse = [usages, type].filter(Boolean).join(" · ")
    if (from.kind === "declaration" && to.kind === "declaration") {
        return [title, kindOfUse].join("<br/>")
    }
    const declarations = `<b>${escapeHtml(only.fromLeaf)} → ${escapeHtml(only.toLeaf)}</b>`
    return [declarations, kindOfUse, `drawn as ${escapeHtml(from.name)} → ${escapeHtml(to.name)}`].join("<br/>")
}

const READABLE_DECIMALS = 1000

function roundedForReading(value: number): number {
    return Math.round(value * READABLE_DECIMALS) / READABLE_DECIMALS
}
