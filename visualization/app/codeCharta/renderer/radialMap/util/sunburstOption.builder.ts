import { CENTRE_RADIUS, DIMMED_OPACITY, OUTER_RADIUS, TRANSITION_MS } from "./radialChartStyle"
import { nodeColor, RadialColoring, readableTextColor } from "./radialColor"
import { RadialOptionInputs, RadialShape } from "./radialShape"
import { buildTooltipFormatter, folderValueText } from "./radialTooltip"
import { RadialNode } from "./radialTree"

export const VISIBLE_RING_COUNT = 3

const CENTRE_RADIUS_PERCENT = CENTRE_RADIUS * 100
const OUTER_RADIUS_PERCENT = OUTER_RADIUS * 100
const MIN_LABEL_ANGLE_DEGREES = 5
const LABEL_PADDING_PX = 8
const SEGMENT_BORDER_COLOR = "#ffffff"
const SEGMENT_BORDER_WIDTH_PX = 1
const HOVER_FADE = { duration: 500, easing: "cubicOut" }

export interface SunburstDatum {
    name: string
    value: number
    displayName: string
    colorValue: number | undefined
    folderValueText: string | undefined
    isCentre: boolean
    isFile: boolean
    itemStyle: { color: string }
    label: { color: string; fontWeight?: "bold" }
    children: SunburstDatum[]
}

interface SunburstFormatterParams {
    data?: SunburstDatum
}

export const SUNBURST_SHAPE: RadialShape = { visibleDepth: VISIBLE_RING_COUNT, buildOption: buildSunburstOption }

export function buildSunburstOption(inputs: RadialOptionInputs) {
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
                animationDurationUpdate: TRANSITION_MS,
                levels: levelsAround(inputs.centre, inputs.chartSizeInPixels / 2)
            }
        ]
    }
}

function levelsAround(centre: RadialNode, radiusInPixels: number) {
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

function toDatum(node: RadialNode, coloring: RadialColoring, ringsLeft: number, isCentre: boolean): SunburstDatum {
    const color = nodeColor(node, coloring)
    return {
        name: node.path,
        value: node.area,
        displayName: node.name,
        colorValue: node.colorValue,
        folderValueText: folderValueText(node, coloring.folders),
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
