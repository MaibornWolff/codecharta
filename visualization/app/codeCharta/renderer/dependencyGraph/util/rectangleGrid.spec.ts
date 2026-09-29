import { Rectangle } from "./geometry"
import { RectangleGrid } from "./rectangleGrid"

const CELL_SIZE = 100
const GRID_SIDE = 10

function cellsOfAGrid(): Rectangle[] {
    return Array.from({ length: GRID_SIDE * GRID_SIDE }, (_, index) => ({
        x: (index % GRID_SIDE) * CELL_SIZE,
        y: Math.floor(index / GRID_SIDE) * CELL_SIZE,
        width: CELL_SIZE / 2,
        height: CELL_SIZE / 2
    }))
}

describe("RectangleGrid", () => {
    it("should find the rectangles near an area and leave out those far from it", () => {
        // Arrange
        const rectangles = cellsOfAGrid()
        const grid = new RectangleGrid(rectangles, rectangle => rectangle)

        // Act
        const near = grid.itemsNear({ x: 210, y: 310, width: 20, height: 20 })

        // Assert
        expect(near).toContain(rectangles[3 * GRID_SIDE + 2])
        expect(near.length).toBeLessThan(rectangles.length / 10)
    })

    it("should find a rectangle spanning many cells once, from every cell it covers", () => {
        // Arrange
        const spanning = { x: 0, y: 0, width: CELL_SIZE * GRID_SIDE, height: CELL_SIZE * GRID_SIDE }
        const grid = new RectangleGrid([...cellsOfAGrid(), spanning], rectangle => rectangle)

        // Act
        const nearCorners = [
            grid.itemsNear({ x: 0, y: 0, width: 1, height: 1 }),
            grid.itemsNear({ x: 950, y: 950, width: 1, height: 1 }),
            grid.itemsNear({ x: 0, y: 0, width: 1000, height: 1000 })
        ]

        // Assert
        expect(nearCorners.map(near => near.filter(item => item === spanning))).toEqual([[spanning], [spanning], [spanning]])
    })

    it("should find the rectangles at the border of an area lying outside the grid", () => {
        // Arrange
        const rectangles = cellsOfAGrid()
        const grid = new RectangleGrid(rectangles, rectangle => rectangle)

        // Act
        const near = grid.itemsNear({ x: -500, y: -500, width: 10, height: 10 })

        // Assert
        expect(near).toContain(rectangles[0])
    })

    it("should find every rectangle of a grid whose rectangles all lie on one spot", () => {
        // Arrange
        const point = { x: 5, y: 5, width: 0, height: 0 }
        const grid = new RectangleGrid([point, { ...point }], rectangle => rectangle)

        // Act
        const near = grid.itemsNear(point)

        // Assert
        expect(near).toHaveLength(2)
    })

    it("should find nothing in an empty grid", () => {
        // Arrange
        const grid = new RectangleGrid<Rectangle>([], rectangle => rectangle)

        // Act
        const near = grid.itemsNear({ x: 0, y: 0, width: 10, height: 10 })

        // Assert
        expect(near).toEqual([])
    })
})
