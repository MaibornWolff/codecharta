import { drawEdge } from "./dependencyGraphEdges"
import { DIMMED_OPACITY } from "./dependencyGraphStyle"
import { anEdge, identityPixels } from "./dependencyGraphTestData"
import { EdgeRoute } from "./edgeRouting"

interface DrawnEdge {
    children: [
        { shape: Record<string, number>; style: Record<string, unknown> },
        { shape: { points: number[][] }; style: Record<string, unknown> }
    ]
}

function draw(route: EdgeRoute, overrides: Parameters<typeof anEdge>[2] = {}, isDimmed = false): DrawnEdge {
    return drawEdge(anEdge("/root/a", "/root/b", overrides), route, isDimmed, identityPixels) as unknown as DrawnEdge
}

const downward: EdgeRoute = { start: [60, 40], startSide: "bottom", end: [90, 140], endSide: "top", bend: "sCurve" }

describe("drawEdge", () => {
    it("should leave and enter square to the sides, pulled out by half the distance", () => {
        // Act
        const [curve, arrow] = draw(downward).children

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

    it("should colour and dash a container-level feedback edge", () => {
        // Act
        const [curve] = draw(downward, { type: "feedbackContainerLevel" }).children

        // Assert
        expect(curve.style).toMatchObject({ stroke: "#dc2626", lineDash: [5, 4] })
    })

    it("should fade a dimmed edge and its arrow", () => {
        // Act
        const { children } = draw(downward, {}, true)

        // Assert
        expect(children.map(child => child.style.opacity)).toEqual([DIMMED_OPACITY, DIMMED_OPACITY])
    })
})
