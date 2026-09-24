import {
    Border,
    CENTRE_RADIUS,
    DIMMED_OPACITY,
    FULL_TURN,
    OUTER_RADIUS,
    pieceAnimation,
    pieceBorder,
    ringWidth,
    WHITE
} from "./radialChartStyle"
import { nodeColor, RadialColoring, readableTextColor } from "./radialColor"
import { describeNode, RadialDatum } from "./radialDatum"
import { RadialOptionInputs, RadialShape } from "./radialShape"
import { buildTooltipFormatter } from "./radialTooltip"
import { levelsBelow, RadialNode } from "./radialTree"

const PERCENT = 100
const CENTRE_RADIUS_PERCENT = CENTRE_RADIUS * PERCENT
const OUTER_RADIUS_PERCENT = OUTER_RADIUS * PERCENT
const MIN_LABEL_ANGLE_DEGREES = 5
const LABEL_PADDING_PX = 8
const SEGMENT_BORDER: Border = { color: WHITE, widthPx: 1 }

interface DatumContext {
    coloring: RadialColoring
    ringCount: number
    /** Every ring shares the centre's full turn, so a node's angle is its share of the centre's area. */
    centreArea: number
    ringInnerRadiiPx: number[]
}

export interface SunburstDatum extends RadialDatum {
    itemStyle: { color: string; borderColor: string; borderWidth: number }
    label: { color: string; fontWeight?: "bold" }
    children: SunburstDatum[]
}

interface SunburstFormatterParams {
    data?: SunburstDatum
}

export function sunburstShape(maxRingCount: number): RadialShape {
    return { visibleDepth: maxRingCount, buildOption: inputs => buildSunburstOption(inputs, maxRingCount) }
}

export function buildSunburstOption(inputs: RadialOptionInputs, maxRingCount: number) {
    const radiusInPixels = inputs.chartSizeInPixels / 2
    const ringCount = Math.max(1, levelsBelow(inputs.centre, maxRingCount))
    const context: DatumContext = {
        coloring: inputs.coloring,
        ringCount,
        centreArea: inputs.centre.area,
        ringInnerRadiiPx: ringInnerRadiiInPixels(ringCount, radiusInPixels)
    }
    const centreDatum = toDatum(inputs.centre, context, 0)
    return {
        aria: { enabled: true },
        tooltip: { show: true, confine: true, formatter: buildTooltipFormatter(inputs.metrics, inputs.isMapRoot) },
        series: [
            {
                type: "sunburst",
                data: [centreDatum],
                radius: ["0%", `${OUTER_RADIUS_PERCENT}%`],
                nodeClick: false,
                sort: "desc",
                emphasis: { focus: "ancestor" },
                blur: { itemStyle: { opacity: DIMMED_OPACITY }, label: { opacity: DIMMED_OPACITY } },
                label: { formatter: labelOf },
                ...pieceAnimation(countOf(centreDatum)),
                levels: levelsAround(ringCount, radiusInPixels)
            }
        ]
    }
}

function countOf(datum: SunburstDatum): number {
    return datum.children.reduce((count, child) => count + countOf(child), 1)
}

function ringInnerRadiiInPixels(ringCount: number, radiusInPixels: number): number[] {
    const width = ringWidth(ringCount)
    return Array.from({ length: ringCount }, (_, ringIndex) => (CENTRE_RADIUS + ringIndex * width) * radiusInPixels)
}

function levelsAround(ringCount: number, radiusInPixels: number) {
    const ringWidthPercent = ringWidth(ringCount) * PERCENT
    const centreDiameterInPixels = (radiusInPixels * CENTRE_RADIUS_PERCENT * 2) / PERCENT
    const virtualRootLevel = {}
    const centreLevel = {
        r0: "0%",
        r: `${CENTRE_RADIUS_PERCENT}%`,
        label: { rotate: 0, fontWeight: "bold", overflow: "truncate", width: centreDiameterInPixels - LABEL_PADDING_PX }
    }
    return [virtualRootLevel, centreLevel, ...ringLevels(ringCount, ringWidthPercent, (radiusInPixels * ringWidthPercent) / PERCENT)]
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
        ...describeNode(node, coloring),
        isCentre,
        itemStyle: { color, borderColor: border.color, borderWidth: border.widthPx },
        label: node.isFile ? { color: readableTextColor(color), fontWeight: "bold" } : { color: readableTextColor(color) },
        children: ring < context.ringCount ? node.children.map(child => toDatum(child, context, ring + 1)) : []
    }
}

function arcAtInnerEdgePx(node: RadialNode, { centreArea, ringInnerRadiiPx }: DatumContext, ring: number): number {
    return (FULL_TURN * node.area * ringInnerRadiiPx[ring - 1]) / centreArea
}

function labelOf({ data }: SunburstFormatterParams): string {
    return data?.displayName ?? ""
}
