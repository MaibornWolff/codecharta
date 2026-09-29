import { aBox, anEdge } from "./dependencyGraphTestData"
import { routeEdges } from "./edgeRouting"
import { LayoutBox } from "./levelizedLayout"

const upper = aBox("/root/upper", { x: 0, y: 0 })
const lowerLeft = aBox("/root/lowerLeft", { x: 0, y: 100 })
const lowerRight = aBox("/root/lowerRight", { x: 300, y: 100 })
const sideBySide = aBox("/root/sideBySide", { x: 300, y: 0 })

function byPathOf(...boxes: LayoutBox[]) {
    return new Map(boxes.map(box => [box.path, box]))
}

describe("routeEdges", () => {
    const boxes = byPathOf(upper, lowerLeft, lowerRight, sideBySide)

    it("should leave a downward edge through the bottom and enter through the top, right of the middle when curved", () => {
        // Arrange
        const downward = anEdge(upper.path, lowerLeft.path)

        // Act
        const [route] = routeEdges([downward], boxes, "curved")

        // Assert
        expect(route).toEqual({ start: [160 * 0.58, 40], startSide: "bottom", end: [160 * 0.58, 100], endSide: "top", bend: "sCurve" })
    })

    it("should leave an upward edge through the top and enter through the bottom", () => {
        // Arrange
        const upward = anEdge(lowerLeft.path, upper.path)

        // Act
        const [route] = routeEdges([upward], boxes, "curved")

        // Assert
        expect(route).toMatchObject({
            startSide: "top",
            endSide: "bottom",
            start: [expect.any(Number), 100],
            end: [expect.any(Number), 40]
        })
    })

    it("should run between the facing sides of boxes in the same row", () => {
        // Arrange
        const edges = [anEdge(upper.path, sideBySide.path), anEdge(sideBySide.path, upper.path)]

        // Act
        const [rightward, leftward] = routeEdges(edges, boxes, "curved")

        // Assert
        expect(rightward).toMatchObject({ startSide: "right", endSide: "left", start: [160, 40 * 0.42], end: [300, 40 * 0.42] })
        expect(leftward).toMatchObject({ startSide: "left", endSide: "right", start: [300, 40 * 0.58], end: [160, 40 * 0.58] })
    })

    it("should spread a side's edges in the order their other ends lie along it", () => {
        // Arrange
        const edges = [anEdge(upper.path, lowerRight.path), anEdge(upper.path, lowerLeft.path)]

        // Act
        const [toRight, toLeft] = routeEdges(edges, boxes, "spread")

        // Assert
        expect(toLeft.start[0]).toBeCloseTo(160 * (0.1 + 0.8 / 3))
        expect(toRight.start[0]).toBeCloseTo(160 * (0.1 + (0.8 * 2) / 3))
        expect(toRight.bend).toBe("sCurve")
    })

    it("should swing an upward edge out through the right sides when upward edges go aside", () => {
        // Arrange
        const edges = [anEdge(lowerLeft.path, upper.path), anEdge(upper.path, lowerLeft.path)]

        // Act
        const [upward, downward] = routeEdges(edges, boxes, "upwardAside")

        // Assert
        expect(upward).toMatchObject({ startSide: "right", endSide: "right", bend: "aside" })
        expect(downward).toMatchObject({ startSide: "bottom", endSide: "top", bend: "sCurve" })
    })

    it("should draw straight lines and bow only a dependency that runs both ways", () => {
        // Arrange
        const edges = [anEdge(upper.path, lowerRight.path), anEdge(upper.path, lowerLeft.path), anEdge(lowerLeft.path, upper.path)]

        // Act
        const [oneWay, there, back] = routeEdges(edges, boxes, "straight")

        // Assert
        expect([oneWay.bend, there.bend, back.bend]).toEqual(["straight", "arc", "arc"])
    })

    describe.each(["curved", "spread", "upwardAside", "straight"] as const)("anchored at the side's middle, drawn %s", style => {
        it("should start and end every edge at the middle of its sides", () => {
            // Arrange
            const edges = [anEdge(upper.path, lowerLeft.path), anEdge(upper.path, lowerRight.path), anEdge(upper.path, sideBySide.path)]

            // Act
            const routes = routeEdges(edges, boxes, style, true)

            // Assert
            expect(routes.map(({ start, end }) => [start, end])).toEqual([
                [
                    [80, 40],
                    [80, 100]
                ],
                [
                    [80, 40],
                    [380, 100]
                ],
                [
                    [160, 20],
                    [300, 20]
                ]
            ])
        })

        it("should bow the two edges of a dependency running both ways apart, as they share their ends", () => {
            // Arrange
            const edges = [anEdge(upper.path, sideBySide.path), anEdge(sideBySide.path, upper.path)]

            // Act
            const [there, back] = routeEdges(edges, boxes, style, true)

            // Assert
            expect([there.bend, back.bend]).toEqual(["arc", "arc"])
        })
    })

    describe.each(["curved", "spread", "straight"] as const)("a dependency running both ways, drawn %s", style => {
        const application = aBox("/root/application")
        const domain = aBox("/root/domain")
        const edges = [anEdge(application.path, domain.path), anEdge(domain.path, application.path)]

        /** Both ends of the downward edge lie right of both ends of the upward one: the edges never cross, and
         * each runs on the side it bows to. */
        function lanesOf(above: LayoutBox, below: LayoutBox) {
            const stacked = byPathOf({ ...above, x: 0, y: 0 }, { ...below, x: 0, y: 100 })
            const routes = routeEdges(edges, stacked, style)
            const downward = routes[edges.findIndex(edge => edge.fromPath === above.path)]
            const upward = routes[edges.findIndex(edge => edge.fromPath === below.path)]
            return Math.min(downward.start[0], downward.end[0]) > Math.max(upward.start[0], upward.end[0])
        }

        it("should run the downward edge right of the upward one, whichever box is above", () => {
            // Arrange
            const stackings = [
                [application, domain],
                [domain, application]
            ]

            // Act
            const lanes = stackings.map(([above, below]) => lanesOf(above, below))

            // Assert
            expect(lanes).toEqual([true, true])
        })
    })
})
