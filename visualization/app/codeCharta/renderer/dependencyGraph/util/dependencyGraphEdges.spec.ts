import { drawEdge } from "./dependencyGraphEdges"
import { DIMMED_OPACITY } from "./dependencyGraphStyle"
import { aBox, anEdge, identityPixels } from "./dependencyGraphTestData"

interface DrawnEdge {
    children: [
        { shape: Record<string, number>; style: Record<string, unknown> },
        { shape: { points: number[][] }; style: Record<string, unknown> }
    ]
}

function draw(...args: Parameters<typeof drawEdge>): DrawnEdge {
    return drawEdge(...args) as unknown as DrawnEdge
}

describe("drawEdge", () => {
    const upper = aBox("/root/upper", { x: 0, y: 0 })
    const lower = aBox("/root/lower", { x: 0, y: 100 })

    it("should leave a downward edge through the bottom and enter through the top", () => {
        // Arrange
        const edge = anEdge(upper.path, lower.path)

        // Act
        const { children } = draw(edge, upper, lower, false, identityPixels)

        // Assert
        expect(children[0].shape).toMatchObject({ x1: 160 * 0.42, y1: 40, x2: 160 * 0.58, y2: 100 })
        expect(children[1].shape.points[0]).toEqual([160 * 0.58, 100])
    })

    it("should leave an upward edge through the top and enter through the bottom", () => {
        // Arrange
        const edge = anEdge(lower.path, upper.path, { type: "feedbackLeafLevel" })

        // Act
        const { children } = draw(edge, lower, upper, false, identityPixels)

        // Assert
        expect(children[0].shape).toMatchObject({ y1: 100, y2: 40 })
        expect(children[0].style.stroke).toBe("#dc2626")
    })

    it("should run between the facing sides of boxes in the same row", () => {
        // Arrange
        const left = aBox("/root/left", { x: 0 })
        const right = aBox("/root/right", { x: 300 })

        // Act
        const { children } = draw(anEdge(right.path, left.path), right, left, false, identityPixels)

        // Assert
        expect(children[0].shape).toMatchObject({ x1: 300, x2: 160 })
    })

    it("should run rightward between boxes in the same row", () => {
        // Arrange
        const left = aBox("/root/left", { x: 0 })
        const right = aBox("/root/right", { x: 300 })

        // Act
        const { children } = draw(anEdge(left.path, right.path), left, right, false, identityPixels)

        // Assert
        expect(children[0].shape).toMatchObject({ x1: 160, x2: 300, cpx1: 230 })
    })

    it("should still bend an edge between boxes that touch", () => {
        // Arrange
        const upper = aBox("/root/upper", { y: 0 })
        const touching = aBox("/root/touching", { y: 40 })

        // Act
        const { children } = draw(anEdge(upper.path, touching.path), upper, touching, false, identityPixels)

        // Assert
        expect(children[0].shape).toMatchObject({ cpy1: 40 + 24, cpy2: 40 - 24 })
    })

    it("should dash a container-level feedback edge", () => {
        // Arrange
        const edge = anEdge(lower.path, upper.path, { type: "feedbackContainerLevel" })

        // Act
        const { children } = draw(edge, lower, upper, false, identityPixels)

        // Assert
        expect(children[0].style.lineDash).toEqual([5, 4])
    })

    it("should fade a dimmed edge and its arrow", () => {
        // Arrange
        const edge = anEdge(upper.path, lower.path)

        // Act
        const { children } = draw(edge, upper, lower, true, identityPixels)

        // Assert
        expect(children.map(child => child.style.opacity)).toEqual([DIMMED_OPACITY, DIMMED_OPACITY])
    })
})
