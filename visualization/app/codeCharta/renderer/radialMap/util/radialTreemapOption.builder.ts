import { CENTRE_RADIUS, DIMMED_OPACITY, TRANSITION_MS } from "./radialChartStyle"
import { nodeColor, readableTextColor } from "./radialColor"
import { RadialOptionInputs, RadialShape } from "./radialShape"
import { buildTooltipFormatter } from "./radialTooltip"
import { AnnularSector, layOutRadialTreemap, MAX_BAND_COUNT, PlacedSector, RadialTreemapPlacement } from "./radialTreemapLayout"

const TWELVE_O_CLOCK = -Math.PI / 2
const QUARTER_TURN = Math.PI / 2
const HALF_TURN = Math.PI
const PIECE_BORDER = { color: "#ffffff", widthPx: 0.5 }
const WEDGE_OUTLINE = { color: "#ffffff", widthPx: 2.5 }
const LABEL_FONT_SIZE_PX = 11
const LABEL_LINE_HEIGHT_PX = 13
const LABEL_PADDING_PX = 4
const MIN_LABEL_LENGTH_PX = 28
const Z_PIECE = 1
const Z_OUTLINE = 2
const Z_LABEL = 3

export interface RadialTreemapDatum {
    id: string
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

interface LabelPlacement {
    x: number
    y: number
    rotation: number
    lengthPx: number
    heightPx: number
}

const UNTRANSFORMED = { x: 0, y: 0, rotation: 0 }

export function buildRadialTreemapOption(inputs: RadialOptionInputs) {
    const placements = layOutRadialTreemap(inputs.centre)
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
                animationDurationUpdate: TRANSITION_MS
            }
        ]
    }
}

export const RADIAL_TREEMAP_SHAPE: RadialShape = { visibleDepth: MAX_BAND_COUNT + 1, buildOption: buildRadialTreemapOption }

// A node is drawn from other pieces around another centre; reshaping the old ones left pieces stranded mid-animation.
function toDatum({ node, isCentre }: RadialTreemapPlacement, { centre, coloring }: RadialOptionInputs): RadialTreemapDatum {
    return {
        id: `${centre.path}|${node.path}`,
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

// ECharts reuses a node's elements by position, keeping whatever an option leaves out: a piece created where a
// label was kept the label's position and rotation, so every element states them.
function drawSector(sector: PlacedSector, color: string, frame: Frame) {
    if (sector.role === "outline") {
        const style = { fill: "none", stroke: WEDGE_OUTLINE.color, lineWidth: WEDGE_OUTLINE.widthPx }
        return { type: "sector", ...UNTRANSFORMED, silent: true, z2: Z_OUTLINE, shape: toScreenShape(sector, frame), style, blur: dimmed() }
    }
    const style = { fill: color, stroke: PIECE_BORDER.color, lineWidth: PIECE_BORDER.widthPx }
    if (sector.role === "centre") {
        const shape = { cx: frame.centreX, cy: frame.centreY, r: sector.outerRadius * frame.radiusPx }
        return { type: "circle", ...UNTRANSFORMED, silent: false, z2: Z_PIECE, shape, style, blur: dimmed() }
    }
    return { type: "sector", ...UNTRANSFORMED, silent: false, z2: Z_PIECE, shape: toScreenShape(sector, frame), style, blur: dimmed() }
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
    const placement = sector.role === "centre" ? centreLabelPlacement(frame) : labelPlacementIn(sector, frame)
    if (placement.lengthPx < MIN_LABEL_LENGTH_PX || placement.heightPx < LABEL_LINE_HEIGHT_PX) {
        return null
    }
    const { x, y, rotation, lengthPx } = placement
    return { type: "text", x, y, rotation, silent: true, z2: Z_LABEL, style: labelStyle(datum, lengthPx), blur: dimmed() }
}

function labelStyle(datum: RadialTreemapDatum, lengthPx: number) {
    return {
        text: datum.displayName,
        fill: readableTextColor(datum.color),
        fontSize: LABEL_FONT_SIZE_PX,
        fontWeight: datum.isCentre || datum.isFile ? "bold" : "normal",
        align: "center",
        verticalAlign: "middle",
        width: lengthPx - LABEL_PADDING_PX,
        overflow: "truncate"
    }
}

function centreLabelPlacement(frame: Frame): LabelPlacement {
    const diameterPx = 2 * CENTRE_RADIUS * frame.radiusPx
    return { x: frame.centreX, y: frame.centreY, rotation: 0, lengthPx: diameterPx, heightPx: diameterPx }
}

// Runs the name along the arc when the piece is wider than deep, along the radius otherwise, and keeps it upright.
function labelPlacementIn(sector: AnnularSector, frame: Frame): LabelPlacement {
    const midAngle = TWELVE_O_CLOCK + (sector.startAngle + sector.endAngle) / 2
    const innerRadiusPx = sector.innerRadius * frame.radiusPx
    const outerRadiusPx = sector.outerRadius * frame.radiusPx
    const midRadiusPx = (innerRadiusPx + outerRadiusPx) / 2
    const angularSpan = sector.endAngle - sector.startAngle
    const isAlongTheArc = angularSpan * midRadiusPx >= outerRadiusPx - innerRadiusPx
    return {
        x: frame.centreX + midRadiusPx * Math.cos(midAngle),
        y: frame.centreY + midRadiusPx * Math.sin(midAngle),
        rotation: upright(isAlongTheArc ? QUARTER_TURN - midAngle : -midAngle),
        ...(isAlongTheArc
            ? roomAlongTheArc(angularSpan, midRadiusPx, outerRadiusPx - innerRadiusPx, outerRadiusPx)
            : { lengthPx: outerRadiusPx - innerRadiusPx, heightPx: angularSpan * innerRadiusPx })
    }
}

// A straight name drifts outwards from the arc towards its ends; it stops where its outer corners reach the rim.
function roomAlongTheArc(angularSpan: number, midRadiusPx: number, depthPx: number, outerRadiusPx: number) {
    const outerEdgeOfTextPx = midRadiusPx + LABEL_LINE_HEIGHT_PX / 2
    const halfChordAtTheRimPx = Math.sqrt(Math.max(0, outerRadiusPx ** 2 - outerEdgeOfTextPx ** 2))
    return { lengthPx: Math.min(angularSpan * midRadiusPx, 2 * halfChordAtTheRimPx), heightPx: depthPx }
}

function upright(rotation: number): number {
    const normalized = Math.atan2(Math.sin(rotation), Math.cos(rotation))
    if (normalized > QUARTER_TURN) {
        return normalized - HALF_TURN
    }
    return normalized < -QUARTER_TURN ? normalized + HALF_TURN : normalized
}

function dimmed() {
    return { style: { opacity: DIMMED_OPACITY } }
}
