import { enclosingRectangle, Rectangle } from "./geometry"

interface GridAxis {
    origin: number
    cellSize: number
    cellCount: number
}

const CELL_SIZE_OF_A_FLAT_AXIS = 1

/** Buckets rectangles by the cells of a grid laid over all of them, about as many cells as rectangles, so a
 * lookup visits the rectangles near an area instead of every one. */
export class RectangleGrid<Item> {
    private readonly columns: GridAxis
    private readonly rows: GridAxis
    private readonly cells: Item[][]

    constructor(
        items: Item[],
        private readonly rectangleOf: (item: Item) => Rectangle
    ) {
        const bounds = enclosingRectangle(items.map(rectangleOf))
        const cellsPerAxis = Math.max(1, Math.ceil(Math.sqrt(items.length)))
        this.columns = gridAxis(bounds.x, bounds.width, cellsPerAxis)
        this.rows = gridAxis(bounds.y, bounds.height, cellsPerAxis)
        this.cells = Array.from({ length: cellsPerAxis * cellsPerAxis }, () => [])
        for (const item of items) {
            this.forEachCellUnder(rectangleOf(item), cell => cell.push(item))
        }
    }

    /** Every item sharing a cell with the area: all that touch it, and some close by. */
    itemsNear(area: Rectangle): Item[] {
        const near = new Set<Item>()
        this.forEachCellUnder(area, cell => {
            for (const item of cell) {
                near.add(item)
            }
        })
        return [...near]
    }

    private forEachCellUnder(area: Rectangle, visit: (cell: Item[]) => void) {
        const [firstColumn, lastColumn] = cellSpan(this.columns, area.x, area.x + area.width)
        const [firstRow, lastRow] = cellSpan(this.rows, area.y, area.y + area.height)
        for (let row = firstRow; row <= lastRow; row++) {
            for (let column = firstColumn; column <= lastColumn; column++) {
                visit(this.cells[row * this.columns.cellCount + column])
            }
        }
    }
}

function gridAxis(origin: number, length: number, cellCount: number): GridAxis {
    return { origin, cellSize: length / cellCount || CELL_SIZE_OF_A_FLAT_AXIS, cellCount }
}

function cellSpan(axis: GridAxis, start: number, end: number): [number, number] {
    return [cellAt(axis, start), cellAt(axis, end)]
}

function cellAt({ origin, cellSize, cellCount }: GridAxis, coordinate: number): number {
    const cell = Math.floor((coordinate - origin) / cellSize)
    return Math.min(cellCount - 1, Math.max(0, cell))
}
