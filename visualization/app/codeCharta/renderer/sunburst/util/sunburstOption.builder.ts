import { escapeHtml } from "../../../util/escapeHtml"
import { nodeColor, readableTextColor, SunburstColoring } from "./sunburstColor"
import { SunburstMetrics, SunburstNode } from "./sunburstTree"

export const VISIBLE_RING_COUNT = 3

const CENTRE_RADIUS_PERCENT = 20
const OUTER_RADIUS_PERCENT = 95
const MIN_LABEL_ANGLE_DEGREES = 5
const LABEL_PADDING_PX = 8
const SEGMENT_BORDER_COLOR = "#ffffff"
const SEGMENT_BORDER_WIDTH_PX = 1
const RING_TRANSITION_MS = 400
const HOVER_FADE = { duration: 500, easing: "cubicOut" }
const DIMMED_OPACITY = 0.45
const numberFormatter = new Intl.NumberFormat("en", { maximumFractionDigits: 2 })

export interface SunburstOptionInputs {
    centre: SunburstNode
    isMapRoot: boolean
    metrics: SunburstMetrics
    coloring: SunburstColoring
    chartSizeInPixels: number
}

export interface SunburstDatum {
    name: string
    value: number
    displayName: string
    colorValue: number | undefined
    isCentre: boolean
    isFile: boolean
    itemStyle: { color: string }
    label: { color: string; fontWeight?: "bold" }
    children: SunburstDatum[]
}

interface SunburstFormatterParams {
    data?: SunburstDatum
}

export function buildSunburstOption(inputs: SunburstOptionInputs) {
    return {
        aria: { enabled: true },
        tooltip: { show: true, confine: true, formatter: buildTooltipFormatter(inputs.metrics, inputs.isMapRoot) },
        series: [
            {
                type: "sunburst",
                data: [toDatum(inputs.centre, inputs.coloring, VISIBLE_RING_COUNT, true)],
                radius: ["0%", `${OUTER_RADIUS_PERCENT}%`],
                nodeClick: false,
                sort: "desc",
                emphasis: { focus: "ancestor" },
                blur: { itemStyle: { opacity: DIMMED_OPACITY }, label: { opacity: DIMMED_OPACITY } },
                stateAnimation: HOVER_FADE,
                itemStyle: { borderColor: SEGMENT_BORDER_COLOR, borderWidth: SEGMENT_BORDER_WIDTH_PX },
                label: { formatter: labelOf },
                animationDurationUpdate: RING_TRANSITION_MS,
                levels: levelsAround(inputs.centre, inputs.chartSizeInPixels / 2)
            }
        ]
    }
}

export type SunburstOption = ReturnType<typeof buildSunburstOption>

function levelsAround(centre: SunburstNode, radiusInPixels: number) {
    const ringCount = Math.max(1, depthBelow(centre, VISIBLE_RING_COUNT))
    const ringWidthPercent = (OUTER_RADIUS_PERCENT - CENTRE_RADIUS_PERCENT) / ringCount
    const centreDiameterInPixels = (radiusInPixels * CENTRE_RADIUS_PERCENT * 2) / 100
    const virtualRootLevel = {}
    const centreLevel = {
        r0: "0%",
        r: `${CENTRE_RADIUS_PERCENT}%`,
        label: { rotate: 0, fontWeight: "bold", overflow: "truncate", width: centreDiameterInPixels - LABEL_PADDING_PX }
    }
    return [virtualRootLevel, centreLevel, ...ringLevels(ringCount, ringWidthPercent, (radiusInPixels * ringWidthPercent) / 100)]
}

function depthBelow(folder: SunburstNode, maxDepth: number): number {
    if (maxDepth === 0 || folder.children.length === 0) {
        return 0
    }
    return 1 + folder.children.reduce((deepest, child) => Math.max(deepest, depthBelow(child, maxDepth - 1)), 0)
}

function ringLevels(ringCount: number, ringWidthPercent: number, ringWidthInPixels: number) {
    return Array.from({ length: ringCount }, (_, ringIndex) => ({
        r0: `${CENTRE_RADIUS_PERCENT + ringIndex * ringWidthPercent}%`,
        r: `${CENTRE_RADIUS_PERCENT + (ringIndex + 1) * ringWidthPercent}%`,
        label: {
            rotate: "radial",
            minAngle: MIN_LABEL_ANGLE_DEGREES,
            overflow: "truncate",
            width: ringWidthInPixels - LABEL_PADDING_PX
        }
    }))
}

function toDatum(node: SunburstNode, coloring: SunburstColoring, ringsLeft: number, isCentre: boolean): SunburstDatum {
    const color = nodeColor(node, coloring)
    return {
        name: node.path,
        value: node.area,
        displayName: node.name,
        colorValue: node.colorValue,
        isCentre,
        isFile: node.isFile,
        itemStyle: { color },
        label: node.isFile ? { color: readableTextColor(color), fontWeight: "bold" } : { color: readableTextColor(color) },
        children: ringsLeft > 0 ? node.children.map(child => toDatum(child, coloring, ringsLeft - 1, false)) : []
    }
}

function labelOf({ data }: SunburstFormatterParams): string {
    return data?.displayName ?? ""
}

function buildTooltipFormatter(metrics: SunburstMetrics, isMapRoot: boolean) {
    return ({ data }: SunburstFormatterParams): string => {
        if (!data) {
            return ""
        }
        const rows = [
            `<b>${escapeHtml(data.name)}</b>`,
            `${escapeHtml(metrics.areaMetric)}: ${numberFormatter.format(data.value)}`,
            `${escapeHtml(metrics.colorMetric)}: ${data.colorValue === undefined ? "–" : numberFormatter.format(data.colorValue)}`
        ]
        if (data.isCentre && !isMapRoot) {
            rows.push("<i>Click to go up one folder</i>")
        }
        return rows.join("<br/>")
    }
}
