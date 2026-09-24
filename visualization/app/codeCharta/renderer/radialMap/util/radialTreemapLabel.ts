import { layOutGlyphsAlongArc } from "./arcGlyphs"
import { CENTRE_RADIUS, QUARTER_TURN } from "./radialChartStyle"
import { readableTextColor } from "./radialColor"
import { RadialDatum } from "./radialDatum"
import { ElementPosition, Frame, groupElement, TWELVE_O_CLOCK, textElement } from "./radialTreemapElements"
import { AnnularSector, PlacedSector } from "./radialTreemapLayout"
import { measureGlyphsIn } from "./textMeasure"

const HALF_TURN = Math.PI
const LABEL_FONT_SIZE_PX = 11
const LABEL_LINE_HEIGHT_PX = 13
const LABEL_PADDING_PX = 4
const MIN_LABEL_LENGTH_PX = 28

type LabelledDatum = Pick<RadialDatum, "displayName" | "isCentre" | "isFile"> & { color: string }

interface LabelPlacement extends ElementPosition {
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

export function drawLabel(sector: PlacedSector, datum: LabelledDatum, frame: Frame) {
    if (sector.role === "outline") {
        return null
    }
    if (sector.role === "centre") {
        return drawStraightLabel(centreLabelPlacement(frame), datum)
    }
    const ring = ringInPixels(sector, frame)
    return ring.arcLengthPx >= ring.depthPx
        ? drawCurvedLabel(ring, datum, frame)
        : drawStraightLabel(uprightAlongRadiusPlacement(ring, frame), datum)
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

function drawStraightLabel(placement: LabelPlacement, datum: LabelledDatum) {
    if (placement.lengthPx < MIN_LABEL_LENGTH_PX || placement.heightPx < LABEL_LINE_HEIGHT_PX) {
        return null
    }
    const style = { ...glyphStyle(datum), text: datum.displayName, width: placement.lengthPx - LABEL_PADDING_PX, overflow: "truncate" }
    return textElement(placement, style)
}

function drawCurvedLabel(ring: RingInPixels, datum: LabelledDatum, frame: Frame) {
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
    return groupElement(glyphs.map(({ glyph, ...position }) => textElement(position, { ...style, text: glyph })))
}

function glyphStyle(datum: LabelledDatum) {
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

function uprightAlongRadiusPlacement(ring: RingInPixels, frame: Frame): LabelPlacement {
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
