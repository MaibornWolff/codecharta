import { DIMMED_OPACITY } from "./radialChartStyle"

export const TWELVE_O_CLOCK = -Math.PI / 2
const Z_PIECE = 1
const Z_OUTLINE = 2
const Z_LABEL = 3
const DIMMED_BLUR = { style: { opacity: DIMMED_OPACITY } }
const RESTORED_ON_HOVER = { style: { opacity: 1 } }
// ECharts reuses a node's elements by position, keeping whatever an option leaves out: a piece created where a
// label was kept the label's position and rotation, so every element states them.
const UNTRANSFORMED = { x: 0, y: 0, rotation: 0 }

interface DrawnElement {
    type: string
    style?: object
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

export function shapeElement(type: "sector" | "circle", shape: object, style: object, interactive: boolean) {
    return { type, ...UNTRANSFORMED, silent: !interactive, z2: interactive ? Z_PIECE : Z_OUTLINE, shape, style, blur: DIMMED_BLUR }
}

export function textElement({ x, y, rotation }: ElementPosition, style: object) {
    return { type: "text", x, y, rotation, silent: true, z2: Z_LABEL, style, blur: DIMMED_BLUR }
}

export function groupElement(children: DrawnElement[]) {
    return { type: "group", ...UNTRANSFORMED, children }
}

export function fadedElement<Element extends DrawnElement>(element: Element): Element {
    if (element.type === "group") {
        return { ...element, children: element.children.map(fadedElement) }
    }
    return { ...element, style: { ...element.style, opacity: DIMMED_OPACITY }, emphasis: RESTORED_ON_HOVER }
}
