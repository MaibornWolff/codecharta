import { Border, CENTRE_RADIUS, DIMMED_OPACITY, OUTER_RADIUS, pieceBorder, TRANSITION_MS } from "./radialChartStyle"
import { nodeColor, RadialColoring, readableTextColor } from "./radialColor"
import { RadialOptionInputs, RadialShape } from "./radialShape"
import { buildTooltipFormatter, folderValueText } from "./radialTooltip"
import { RadialNode } from "./radialTree"

export const VISIBLE_RING_COUNT = 3

const CENTRE_RADIUS_PERCENT = CENTRE_RADIUS * 100
const OUTER_RADIUS_PERCENT = OUTER_RADIUS * 100
const MIN_LABEL_ANGLE_DEGREES = 5
const LABEL_PADDING_PX = 8
const SEGMENT_BORDER: Border = { color: "#ffffff", widthPx: 1 }
const HOVER_FADE = { duration: 500, easing: "cubicOut" }
const FULL_TURN = 2 * Math.PI

interface DatumContext {
    coloring: RadialColoring
    /** Every ring shares the centre's full turn, so a node's angle is its share of the centre's area. */
    centreArea: number
    ringInnerRadiiPx: number[]
}

export interface SunburstDatum {
    name: string
    value: number
    displayName: string
    colorValue: number | undefined
    folderValueText: string | undefined
    isCentre: boolean
    isFile: boolean
    itemStyle: { color: string; borderColor: string; borderWidth: number }
    label: { color: string; fontWeight?: "bold" }
    children: SunburstDatum[]
}

interface SunburstFormatterParams {
    data?: SunburstDatum
}

export const SUNBURST_SHAPE: RadialShape = { visibleDepth: VISIBLE_RING_COUNT, buildOption: buildSunburstOption }

export function buildSunburstOption(inputs: RadialOptionInputs) {
    const radiusInPixels = inputs.chartSizeInPixels / 2
    const ringCount = ringCountAround(inputs.centre)
    const context: DatumContext = {
        coloring: inputs.coloring,
        centreArea: inputs.centre.area,
        ringInnerRadiiPx: ringInnerRadiiInPixels(ringCount, radiusInPixels)
    }
    return {
        aria: { enabled: true },
        tooltip: { show: true, confine: true, formatter: buildTooltipFormatter(inputs.metrics, inputs.isMapRoot) },
        series: [
            {
                type: "sunburst",
                data: [toDatum(inputs.centre, context, 0)],
                radius: ["0%", `${OUTER_RADIUS_PERCENT}%`],
                nodeClick: false,
                sort: "desc",
                emphasis: { focus: "ancestor" },
                blur: { itemStyle: { opacity: DIMMED_OPACITY }, label: { opacity: DIMMED_OPACITY } },
                stateAnimation: HOVER_FADE,
                label: { formatter: labelOf },
                animationDurationUpdate: TRANSITION_MS,
                levels: levelsAround(ringCount, radiusInPixels)
            }
        ]
    }
}

function ringCountAround(centre: RadialNode): number {
    return Math.max(1, depthBelow(centre, VISIBLE_RING_COUNT))
}

function ringInnerRadiiInPixels(ringCount: number, radiusInPixels: number): number[] {
    const ringWidth = (OUTER_RADIUS - CENTRE_RADIUS) / ringCount
    return Array.from({ length: ringCount }, (_, ringIndex) => (CENTRE_RADIUS + ringIndex * ringWidth) * radiusInPixels)
}

function levelsAround(ringCount: number, radiusInPixels: number) {
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

function depthBelow(folder: RadialNode, maxDepth: number): number {
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

function toDatum(node: RadialNode, context: DatumContext, ring: number): SunburstDatum {
    const { coloring } = context
    const color = nodeColor(node, coloring)
    const isCentre = ring === 0
    const border = isCentre ? SEGMENT_BORDER : pieceBorder(color, SEGMENT_BORDER, arcAtInnerEdgePx(node, context, ring))
    return {
        name: node.path,
        value: node.area,
        displayName: node.name,
        colorValue: node.colorValue,
        folderValueText: folderValueText(node, coloring.folders),
        isCentre,
        isFile: node.isFile,
        itemStyle: { color, borderColor: border.color, borderWidth: border.widthPx },
        label: node.isFile ? { color: readableTextColor(color), fontWeight: "bold" } : { color: readableTextColor(color) },
        children: ring < VISIBLE_RING_COUNT ? node.children.map(child => toDatum(child, context, ring + 1)) : []
    }
}

function arcAtInnerEdgePx(node: RadialNode, { centreArea, ringInnerRadiiPx }: DatumContext, ring: number): number {
    return (FULL_TURN * node.area * ringInnerRadiiPx[ring - 1]) / centreArea
}

function labelOf({ data }: SunburstFormatterParams): string {
    return data?.displayName ?? ""
}
