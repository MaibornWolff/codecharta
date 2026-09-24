import { Border, borderWidthThatFits, pieceAnimation, pieceBorder, WHITE } from "./radialChartStyle"
import { nodeColor } from "./radialColor"
import { describeNode, RadialDatum } from "./radialDatum"
import { Frame, shapeElement, TWELVE_O_CLOCK } from "./radialElements"
import { drawLabel } from "./radialLabel"
import { AnnularSector, PlacedSector, RadialPlacement } from "./radialPlacement"
import { RadialOptionInputs } from "./radialShape"
import { buildTooltipFormatter } from "./radialTooltip"

const WEDGE_OUTLINE = { color: WHITE, widthPx: 2.5 }

export interface RadialPieceDatum extends RadialDatum {
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
// On a map with many pieces ECharts draws the hovered piece on a layer of its own, and a quick sweep across the
// rings left some files there faded for good. Hovering fades every other piece anyway, so the layer saves nothing.
const NEVER_DRAW_HOVER_ON_ITS_OWN_LAYER = Number.POSITIVE_INFINITY

export function buildRadialPiecesOption(inputs: RadialOptionInputs, placements: RadialPlacement[], border: Border) {
    const data = placements.map(placement => toDatum(placement, inputs))
    return {
        aria: { enabled: true },
        hoverLayerThreshold: NEVER_DRAW_HOVER_ON_ITS_OWN_LAYER,
        tooltip: { show: true, confine: true, formatter: buildTooltipFormatter(inputs.metrics, inputs.isMapRoot) },
        series: [
            {
                type: "custom",
                coordinateSystem: "none",
                data,
                renderItem: ({ dataIndex }: { dataIndex: number }, chartSize: ChartSize) =>
                    drawPlacement(placements[dataIndex], data[dataIndex], { frame: frameOf(chartSize), border }),
                ...pieceAnimation(data.length),
                progressive: DRAW_EVERY_PIECE_IN_ONE_FRAME
            }
        ]
    }
}

// A node is drawn from other pieces around another centre; reshaping the old ones left pieces stranded mid-animation.
function toDatum({ node, isCentre }: RadialPlacement, { centre, coloring }: RadialOptionInputs): RadialPieceDatum {
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

interface Canvas {
    frame: Frame
    border: Border
}

function drawPlacement(placement: RadialPlacement, datum: RadialPieceDatum, canvas: Canvas) {
    const pieces = placement.sectors.map(sector => drawSector(sector, datum.color, canvas))
    const labels = placement.sectors.map(sector => drawLabel(sector, datum, canvas.frame)).filter(label => label !== null)
    return { type: "group", focus: "self", children: [...pieces, ...labels] }
}

function drawSector(sector: PlacedSector, color: string, { frame, border }: Canvas) {
    if (sector.role === "outline") {
        const lineWidth = borderWidthThatFits(WEDGE_OUTLINE.widthPx, thinnestSidePx(sector, frame))
        return shapeElement("sector", toScreenShape(sector, frame), { fill: "none", stroke: WEDGE_OUTLINE.color, lineWidth }, false)
    }
    if (sector.role === "centre") {
        const shape = { cx: frame.centreX, cy: frame.centreY, r: sector.outerRadius * frame.radiusPx }
        return shapeElement("circle", shape, { fill: color, stroke: border.color, lineWidth: border.widthPx }, true)
    }
    const fitting = pieceBorder(color, border, thinnestSidePx(sector, frame))
    return shapeElement("sector", toScreenShape(sector, frame), { fill: color, stroke: fitting.color, lineWidth: fitting.widthPx }, true)
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
