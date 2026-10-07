import { drawEdge, EdgeLook } from "./dependencyGraphEdges"
import { DIMMED_OPACITY, SELECTED_COLOR } from "./dependencyGraphStyle"
import { EDGE_COLORS, identityPixels } from "./dependencyGraphTestData"
import { EdgeRoute } from "./edgeRouting"
import { PLAIN_LINE } from "./lineStyle"

interface DrawnPart {
    type: string
    silent?: boolean
    shape: Record<string, number> & { points?: number[][] }
    style: Record<string, unknown>
}

interface DrawnEdge {
    children: DrawnPart[]
}

function draw(route: EdgeRoute, look: Partial<EdgeLook> = {}): DrawnEdge {
    const edgeLook = {
        isDimmed: false,
        isSelected: false,
        widthPx: 1.2,
        color: EDGE_COLORS.regular,
        line: PLAIN_LINE,
        ...look
    }
    return drawEdge(route, edgeLook, identityPixels) as unknown as DrawnEdge
}

const downward: EdgeRoute = { start: [60, 40], startSide: "bottom", end: [90, 140], endSide: "top", bend: "sCurve" }

describe("drawEdge", () => {
    it("should leave and enter square to the sides, pulled out by half the distance", () => {
        // Arrange
        const route = downward

        // Act
        const [curve, arrow] = draw(route).children

        // Assert
        expect(curve.shape).toEqual({ x1: 60, y1: 40, cpx1: 60, cpy1: 90, cpx2: 90, cpy2: 90, x2: 90, y2: 140 })
        expect(arrow.shape.points[0]).toEqual([90, 140])
    })

    it("should still pull out a short edge between facing sides", () => {
        // Arrange
        const route: EdgeRoute = { start: [160, 20], startSide: "right", end: [170, 20], endSide: "left", bend: "sCurve" }

        // Act
        const [curve] = draw(route).children

        // Assert
        expect(curve.shape).toMatchObject({ cpx1: 160 + 24, cpx2: 170 - 24 })
    })

    it("should draw a straight line with its pulls on the line", () => {
        // Arrange
        const route: EdgeRoute = { start: [0, 0], startSide: "bottom", end: [0, 90], endSide: "top", bend: "straight" }

        // Act
        const [curve] = draw(route).children

        // Assert
        expect(curve.shape).toMatchObject({ cpx1: 0, cpy1: 30, cpx2: 0, cpy2: 60 })
    })

    it("should bow the two directions of a two-way dependency to opposite sides", () => {
        // Arrange
        const there: EdgeRoute = { start: [0, 0], startSide: "bottom", end: [0, 90], endSide: "top", bend: "arc" }
        const back: EdgeRoute = { start: [0, 90], startSide: "top", end: [0, 0], endSide: "bottom", bend: "arc" }

        // Act
        const [thereCurve] = draw(there).children
        const [backCurve] = draw(back).children

        // Assert
        expect(thereCurve.shape.cpx1).toBeCloseTo(14)
        expect(backCurve.shape.cpx1).toBeCloseTo(-14)
    })

    it("should swing an aside edge out to the right of both ends", () => {
        // Arrange
        const route: EdgeRoute = { start: [160, 120], startSide: "right", end: [160, 20], endSide: "right", bend: "aside" }

        // Act
        const [curve] = draw(route).children

        // Assert
        expect(curve.shape).toMatchObject({ cpx1: 160 + 40, cpy1: 120, cpx2: 160 + 40, cpy2: 20 })
    })

    it("should swing an aside edge that leaves through the left out to the left of both ends", () => {
        // Arrange
        const route: EdgeRoute = { start: [0, 20], startSide: "left", end: [30, 120], endSide: "left", bend: "aside" }

        // Act
        const [curve] = draw(route).children

        // Assert
        expect(curve.shape).toMatchObject({ cpx1: -40, cpy1: 20, cpx2: -40, cpy2: 120 })
    })

    it("should draw the line in the colour and dashes its look says, with a filled arrow", () => {
        // Arrange
        const dashedRed: Partial<EdgeLook> = { color: "#dc2626", line: { dash: [5, 4], head: "filled" } }

        // Act
        const [curve, arrow] = draw(downward, dashedRed).children

        // Assert
        expect(curve.style).toMatchObject({ stroke: "#dc2626", lineDash: [5, 4] })
        expect(arrow).toMatchObject({ type: "polygon", style: { fill: "#dc2626" } })
    })

    it("should end the line in a hollow, an open or a round head when its look asks for one", () => {
        // Arrange
        const heads = ["hollow", "open", "dot"] as const

        // Act
        const [hollow, open, dot] = heads.map(head => draw(downward, { line: { dash: null, head } }).children[1])

        // Assert
        expect(hollow).toMatchObject({ type: "polygon", style: { fill: "#ffffff", stroke: EDGE_COLORS.regular } })
        expect(open).toMatchObject({ type: "polyline", style: { fill: null, stroke: EDGE_COLORS.regular } })
        expect(open.shape.points[1]).toEqual([90, 140])
        expect(dot).toMatchObject({ type: "circle", shape: { cx: 90, cy: 140, r: 4 }, style: { fill: EDGE_COLORS.regular } })
    })

    it("should lay a halo in the selection colour under a selected edge", () => {
        // Arrange
        const selected = { isSelected: true, widthPx: 2 }

        // Act
        const { children } = draw(downward, selected)

        // Assert
        expect(children).toHaveLength(3)
        expect(children[0].style).toMatchObject({ stroke: SELECTED_COLOR, lineWidth: 8 })
        expect(children[0].shape).toEqual(children[1].shape)
    })

    it("should say of the line and its arrow that they react to the pointer, as they may be drawn on a halo that does not", () => {
        // Arrange
        const selected = { isSelected: true }

        // Act
        const [halo, line, head] = draw(downward, selected).children

        // Assert
        expect([halo.silent, line.silent, head.silent]).toEqual([true, false, false])
    })

    it("should fade a dimmed edge and its arrow", () => {
        // Arrange
        const dimmed = { isDimmed: true }

        // Act
        const { children } = draw(downward, dimmed)

        // Assert
        expect(children.map(child => child.style.opacity)).toEqual([DIMMED_OPACITY, DIMMED_OPACITY])
    })

    it("should draw the edge as wide as its look says", () => {
        // Arrange
        const wide = { widthPx: 3 }

        // Act
        const [curve] = draw(downward, wide).children

        // Assert
        expect(curve.style.lineWidth).toBe(3)
    })

    it("should grow the arrow with a wide edge, so the line never swallows it", () => {
        // Arrange
        const [thin, wide] = [{ widthPx: 1.2 }, { widthPx: 6 }]

        // Act
        const [, thinArrow] = draw(downward, thin).children
        const [, wideArrow] = draw(downward, wide).children

        // Assert
        const lengthOf = (points: number[][]) => points[0][1] - points[1][1]
        expect(lengthOf(thinArrow.shape.points)).toBeCloseTo(8)
        expect(lengthOf(wideArrow.shape.points)).toBeCloseTo(18)
    })
})
