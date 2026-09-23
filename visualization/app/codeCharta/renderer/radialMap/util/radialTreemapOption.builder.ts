import { nodeColor, RadialColoring, readableTextColor } from "./radialColor"
import { RadialOptionInputs, RadialShape } from "./radialShape"
import { buildTooltipFormatter } from "./radialTooltip"
import {
    AnnularSector,
    CENTRE_RADIUS,
    layOutRadialTreemap,
    MAX_BAND_COUNT,
    PlacedSector,
    RadialTreemapPlacement
} from "./radialTreemapLayout"

const TWELVE_O_CLOCK = -Math.PI / 2
const QUARTER_TURN = Math.PI / 2
const HALF_TURN = Math.PI
const PIECE_BORDER = { color: "#ffffff", widthPx: 0.5 }
const WEDGE_OUTLINE = { color: "#ffffff", widthPx: 2.5 }
const DIMMED = { style: { opacity: 0.45 } }
const TRANSITION_MS = 400
const LABEL_FONT_SIZE_PX = 11
const LABEL_PADDING_PX = 4
const MIN_LABEL_LENGTH_PX = 28
const MIN_LABEL_HEIGHT_PX = 13
const Z_PIECE = 1
const Z_OUTLINE = 2
const Z_LABEL = 3

export interface RadialTreemapDatum {
    name: string
    value: number
    displayName: string
    colorValue: number | undefined
    isCentre: boolean
    isFile: boolean
    color: string
}

interface ChartSize {
    getWidth(): number
    getHeight(): number
}

interface Frame {
    centreX: number
    centreY: number
    radiusPx: number
}

export function buildRadialTreemapOption(inputs: RadialOptionInputs) {
    const placements = layOutRadialTreemap(inputs.centre)
    const data = placements.map(placement => toDatum(placement, inputs.coloring))
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
                animationDurationUpdate: TRANSITION_MS
            }
        ]
    }
}

export const RADIAL_TREEMAP_SHAPE: RadialShape = { visibleDepth: MAX_BAND_COUNT + 1, buildOption: buildRadialTreemapOption }

function toDatum({ node, isCentre }: RadialTreemapPlacement, coloring: RadialColoring): RadialTreemapDatum {
    return {
        name: node.path,
        value: node.area,
        displayName: node.name,
        colorValue: node.colorValue,
        isCentre,
        isFile: node.isFile,
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

// Redrawing reuses the elements of the previous centre and keeps any setting left out, so each one is set in full.
function drawSector(sector: PlacedSector, color: string, frame: Frame) {
    if (sector.role === "outline") {
        const style = { fill: "none", stroke: WEDGE_OUTLINE.color, lineWidth: WEDGE_OUTLINE.widthPx }
        return { type: "sector", silent: true, z2: Z_OUTLINE, shape: toScreenShape(sector, frame), style, blur: DIMMED }
    }
    const style = { fill: color, stroke: PIECE_BORDER.color, lineWidth: PIECE_BORDER.widthPx }
    if (sector.role === "centre") {
        const shape = { cx: frame.centreX, cy: frame.centreY, r: sector.outerRadius * frame.radiusPx }
        return { type: "circle", silent: false, z2: Z_PIECE, shape, style, blur: DIMMED }
    }
    return { type: "sector", silent: false, z2: Z_PIECE, shape: toScreenShape(sector, frame), style, blur: DIMMED }
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

function drawLabel(sector: PlacedSector, datum: RadialTreemapDatum, frame: Frame) {
    if (sector.role === "outline") {
        return null
    }
    const placement = sector.role === "centre" ? centreLabelPlacement(frame) : labelPlacementAlong(sector, frame)
    if (placement.lengthPx < MIN_LABEL_LENGTH_PX || placement.heightPx < MIN_LABEL_HEIGHT_PX) {
        return null
    }
    return {
        type: "text",
        silent: true,
        z2: Z_LABEL,
        x: placement.x,
        y: placement.y,
        rotation: placement.rotation,
        style: {
            text: datum.displayName,
            fill: readableTextColor(datum.color),
            fontSize: LABEL_FONT_SIZE_PX,
            fontWeight: datum.isCentre || datum.isFile ? "bold" : "normal",
            align: "center",
            verticalAlign: "middle",
            width: placement.lengthPx - LABEL_PADDING_PX,
            overflow: "truncate"
        },
        blur: DIMMED
    }
}

function centreLabelPlacement(frame: Frame) {
    const diameterPx = 2 * CENTRE_RADIUS * frame.radiusPx
    return { x: frame.centreX, y: frame.centreY, rotation: 0, lengthPx: diameterPx, heightPx: diameterPx }
}

// Runs the name along the arc when the piece is wider than deep, along the radius otherwise, and keeps it upright.
function labelPlacementAlong(sector: AnnularSector, frame: Frame) {
    const midAngle = TWELVE_O_CLOCK + (sector.startAngle + sector.endAngle) / 2
    const midRadiusPx = ((sector.innerRadius + sector.outerRadius) / 2) * frame.radiusPx
    const arcLengthPx = (sector.endAngle - sector.startAngle) * midRadiusPx
    const depthPx = (sector.outerRadius - sector.innerRadius) * frame.radiusPx
    const isAlongTheArc = arcLengthPx >= depthPx
    return {
        x: frame.centreX + midRadiusPx * Math.cos(midAngle),
        y: frame.centreY + midRadiusPx * Math.sin(midAngle),
        rotation: upright(isAlongTheArc ? QUARTER_TURN - midAngle : -midAngle),
        lengthPx: Math.max(arcLengthPx, depthPx),
        heightPx: Math.min(arcLengthPx, depthPx)
    }
}

function upright(rotation: number): number {
    const normalized = Math.atan2(Math.sin(rotation), Math.cos(rotation))
    if (normalized > QUARTER_TURN) {
        return normalized - HALF_TURN
    }
    return normalized < -QUARTER_TURN ? normalized + HALF_TURN : normalized
}
