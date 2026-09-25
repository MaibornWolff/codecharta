import convert from "color-convert"
import { DIMMED_OPACITY } from "./radialChartStyle"

export const TWELVE_O_CLOCK = -Math.PI / 2
const Z_PIECE = 1
const Z_OUTLINE = 2
const Z_LABEL = 3
const DIMMED_BLUR = { style: { opacity: DIMMED_OPACITY } }
const HEX_COLOR = /^#[\da-f]{6}$/i
// ECharts reuses a node's elements by position, keeping whatever an option leaves out: a piece created where a
// label was kept the label's position and rotation, so every element states them.
const UNTRANSFORMED = { x: 0, y: 0, rotation: 0 }

interface PaintStyle {
    fill?: string
    stroke?: string
    [property: string]: unknown
}

interface DrawnElement {
    type: string
    style?: PaintStyle
    children?: DrawnElement[]
}

export interface Frame {
    centreX: number
    centreY: number
    radiusPx: number
}

export interface ElementPosition {
    x: number
    y: number
    rotation: number
}

export function shapeElement(type: "sector" | "circle", shape: object, style: PaintStyle, interactive: boolean) {
    return { type, ...UNTRANSFORMED, silent: !interactive, z2: interactive ? Z_PIECE : Z_OUTLINE, shape, style, blur: DIMMED_BLUR }
}

export function textElement({ x, y, rotation }: ElementPosition, style: PaintStyle) {
    return { type: "text", x, y, rotation, silent: true, z2: Z_LABEL, style, blur: DIMMED_BLUR }
}

export function groupElement(children: DrawnElement[]) {
    return { type: "group", ...UNTRANSFORMED, children }
}

// Faded through the colours rather than the opacity: ECharts animates the opacity back from a hover for a while,
// and a fade drawn while that runs was overwritten by it.
export function fadedElement<Element extends DrawnElement>(element: Element): Element {
    if (element.type === "group") {
        return { ...element, children: element.children.map(fadedElement) }
    }
    const { fill, stroke } = element.style
    const faded = { fill: fadedColor(fill), stroke: fadedColor(stroke) }
    return { ...element, style: { ...element.style, ...faded }, emphasis: { style: { fill, stroke } } }
}

function fadedColor(color: string | undefined): string | undefined {
    if (!color || !HEX_COLOR.test(color)) {
        return color
    }
    const [red, green, blue] = convert.hex.rgb(color)
    return `rgba(${red}, ${green}, ${blue}, ${DIMMED_OPACITY})`
}
