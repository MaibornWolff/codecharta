import { layOutGlyphsAlongArc } from "./arcGlyphs"
import { CENTRE_RADIUS, DIMMED_OPACITY, TRANSITION_MS } from "./radialChartStyle"
import { nodeColor, readableTextColor } from "./radialColor"
import { RadialOptionInputs, RadialShape } from "./radialShape"
import { buildTooltipFormatter, folderValueText } from "./radialTooltip"
import { AnnularSector, layOutRadialTreemap, MAX_BAND_COUNT, PlacedSector, RadialTreemapPlacement } from "./radialTreemapLayout"
import { measureGlyphsIn } from "./textMeasure"

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
    folderValueText: string | undefined
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

interface RingInPixels {
    midAngle: number
    innerRadiusPx: number
    midRadiusPx: number
    angularSpan: number
    arcLengthPx: number
    depthPx: number
}

const UNTRANSFORMED = { x: 0, y: 0, rotation: 0 }
// ECharts draws a large custom series in chunks over several frames, and redraws it that way on every
// hover, so a big map would sweep round like a clock hand each time the pointer moves.
const DRAW_EVERY_PIECE_IN_ONE_FRAME = 0

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
                animationDurationUpdate: TRANSITION_MS,
                progressive: DRAW_EVERY_PIECE_IN_ONE_FRAME
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
        folderValueText: folderValueText(node, coloring.folders),
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
    if (sector.role === "centre") {
        return drawStraightLabel(centreLabelPlacement(frame), datum)
    }
    const ring = ringInPixels(sector, frame)
    return ring.arcLengthPx >= ring.depthPx
        ? drawCurvedLabel(ring, datum, frame)
        : drawStraightLabel(radialLabelPlacement(ring, frame), datum)
}

function ringInPixels(sector: AnnularSector, frame: Frame): RingInPixels {
    const innerRadiusPx = sector.innerRadius * frame.radiusPx
    const outerRadiusPx = sector.outerRadius * frame.radiusPx
    const midRadiusPx = (innerRadiusPx + outerRadiusPx) / 2
    const angularSpan = sector.endAngle - sector.startAngle
    return {
        midAngle: TWELVE_O_CLOCK + (sector.startAngle + sector.endAngle) / 2,
        innerRadiusPx,
        midRadiusPx,
        angularSpan,
        arcLengthPx: angularSpan * midRadiusPx,
        depthPx: outerRadiusPx - innerRadiusPx
    }
}

function drawStraightLabel(placement: LabelPlacement, datum: RadialTreemapDatum) {
    if (placement.lengthPx < MIN_LABEL_LENGTH_PX || placement.heightPx < LABEL_LINE_HEIGHT_PX) {
        return null
    }
    const { x, y, rotation, lengthPx } = placement
    const style = { ...glyphStyle(datum), text: datum.displayName, width: lengthPx - LABEL_PADDING_PX, overflow: "truncate" }
    return { type: "text", x, y, rotation, silent: true, z2: Z_LABEL, style, blur: dimmed() }
}

function drawCurvedLabel(ring: RingInPixels, datum: RadialTreemapDatum, frame: Frame) {
    const lengthPx = ring.arcLengthPx - LABEL_PADDING_PX
    if (lengthPx < MIN_LABEL_LENGTH_PX || ring.depthPx < LABEL_LINE_HEIGHT_PX) {
        return null
    }
    const style = glyphStyle(datum)
    const arc = { centreX: frame.centreX, centreY: frame.centreY, radiusPx: ring.midRadiusPx, midAngle: ring.midAngle, lengthPx }
    const glyphs = layOutGlyphsAlongArc(datum.displayName, arc, measureGlyphsIn(style.fontWeight, style.fontSize))
    if (glyphs.length === 0) {
        return null
    }
    const children = glyphs.map(({ glyph, x, y, rotation }) => ({
        type: "text",
        x,
        y,
        rotation,
        silent: true,
        z2: Z_LABEL,
        style: { ...style, text: glyph },
        blur: dimmed()
    }))
    return { type: "group", ...UNTRANSFORMED, children }
}

function glyphStyle(datum: RadialTreemapDatum) {
    return {
        fill: readableTextColor(datum.color),
        fontSize: LABEL_FONT_SIZE_PX,
        fontWeight: datum.isCentre || datum.isFile ? "bold" : "normal",
        align: "center",
        verticalAlign: "middle"
    }
}

function centreLabelPlacement(frame: Frame): LabelPlacement {
    const diameterPx = 2 * CENTRE_RADIUS * frame.radiusPx
    return { x: frame.centreX, y: frame.centreY, rotation: 0, lengthPx: diameterPx, heightPx: diameterPx }
}

// Runs the name outwards along the radius, turned so that it never reads upside down.
function radialLabelPlacement(ring: RingInPixels, frame: Frame): LabelPlacement {
    return {
        x: frame.centreX + ring.midRadiusPx * Math.cos(ring.midAngle),
        y: frame.centreY + ring.midRadiusPx * Math.sin(ring.midAngle),
        rotation: upright(-ring.midAngle),
        lengthPx: ring.depthPx,
        heightPx: ring.angularSpan * ring.innerRadiusPx
    }
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
