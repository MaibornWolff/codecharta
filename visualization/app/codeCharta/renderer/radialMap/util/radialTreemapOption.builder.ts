import { Border, borderWidthThatFits, pieceBorder, TRANSITION_MS, WHITE } from "./radialChartStyle"
import { nodeColor } from "./radialColor"
import { describeNode, RadialDatum } from "./radialDatum"
import { RadialOptionInputs, RadialShape } from "./radialShape"
import { buildTooltipFormatter } from "./radialTooltip"
import { Frame, shapeElement, TWELVE_O_CLOCK } from "./radialTreemapElements"
import { drawLabel } from "./radialTreemapLabel"
import { AnnularSector, layOutRadialTreemap, PlacedSector, RadialTreemapPlacement } from "./radialTreemapLayout"

const PIECE_BORDER: Border = { color: WHITE, widthPx: 0.5 }
const WEDGE_OUTLINE = { color: WHITE, widthPx: 2.5 }

export interface RadialTreemapDatum extends RadialDatum {
    id: string
    color: string
}

interface ChartSize {
    getWidth(): number
    getHeight(): number
}

// ECharts draws a large custom series in chunks over several frames, and redraws it that way on every
// hover, so a big map would sweep round like a clock hand each time the pointer moves.
const DRAW_EVERY_PIECE_IN_ONE_FRAME = 0

// The last band shows its folders' contents as a treemap, so the map draws one level deeper than it has bands.
export function radialTreemapShape(maxBandCount: number): RadialShape {
    return { visibleDepth: maxBandCount + 1, buildOption: inputs => buildRadialTreemapOption(inputs, maxBandCount) }
}

export function buildRadialTreemapOption(inputs: RadialOptionInputs, maxBandCount: number) {
    const placements = layOutRadialTreemap(inputs.centre, maxBandCount)
    const data = placements.map(placement => toDatum(placement, inputs))
    return {
        aria: { enabled: true },
        tooltip: { show: true, confine: true, formatter: buildTooltipFormatter(inputs.metrics, inputs.isMapRoot) },
        series: [
            {
                type: "custom",
                coordinateSystem: "none",
                data,
                renderItem: ({ dataIndex }: { dataIndex: number }, chartSize: ChartSize) =>
                    drawPlacement(placements[dataIndex], data[dataIndex], frameOf(chartSize)),
                animationDurationUpdate: TRANSITION_MS,
                progressive: DRAW_EVERY_PIECE_IN_ONE_FRAME
            }
        ]
    }
}

// A node is drawn from other pieces around another centre; reshaping the old ones left pieces stranded mid-animation.
function toDatum({ node, isCentre }: RadialTreemapPlacement, { centre, coloring }: RadialOptionInputs): RadialTreemapDatum {
    return {
        ...describeNode(node, coloring),
        id: `${centre.path}|${node.path}`,
        isCentre,
        color: nodeColor(node, coloring)
    }
}

function frameOf(chartSize: ChartSize): Frame {
    const width = chartSize.getWidth()
    const height = chartSize.getHeight()
    return { centreX: width / 2, centreY: height / 2, radiusPx: Math.min(width, height) / 2 }
}

function drawPlacement(placement: RadialTreemapPlacement, datum: RadialTreemapDatum, frame: Frame) {
    const pieces = placement.sectors.map(sector => drawSector(sector, datum.color, frame))
    const labels = placement.sectors.map(sector => drawLabel(sector, datum, frame)).filter(label => label !== null)
    return { type: "group", focus: "self", children: [...pieces, ...labels] }
}

function drawSector(sector: PlacedSector, color: string, frame: Frame) {
    if (sector.role === "outline") {
        const lineWidth = borderWidthThatFits(WEDGE_OUTLINE.widthPx, thinnestSidePx(sector, frame))
        return shapeElement("sector", toScreenShape(sector, frame), { fill: "none", stroke: WEDGE_OUTLINE.color, lineWidth }, false)
    }
    if (sector.role === "centre") {
        const shape = { cx: frame.centreX, cy: frame.centreY, r: sector.outerRadius * frame.radiusPx }
        return shapeElement("circle", shape, { fill: color, stroke: PIECE_BORDER.color, lineWidth: PIECE_BORDER.widthPx }, true)
    }
    const border = pieceBorder(color, PIECE_BORDER, thinnestSidePx(sector, frame))
    return shapeElement("sector", toScreenShape(sector, frame), { fill: color, stroke: border.color, lineWidth: border.widthPx }, true)
}

function thinnestSidePx(sector: AnnularSector, frame: Frame): number {
    const arcAtInnerEdgePx = (sector.endAngle - sector.startAngle) * sector.innerRadius * frame.radiusPx
    const depthPx = (sector.outerRadius - sector.innerRadius) * frame.radiusPx
    return Math.min(arcAtInnerEdgePx, depthPx)
}

function toScreenShape(sector: AnnularSector, frame: Frame) {
    return {
        cx: frame.centreX,
        cy: frame.centreY,
        r0: sector.innerRadius * frame.radiusPx,
        r: sector.outerRadius * frame.radiusPx,
        startAngle: TWELVE_O_CLOCK + sector.startAngle,
        endAngle: TWELVE_O_CLOCK + sector.endAngle,
        clockwise: true
    }
}
