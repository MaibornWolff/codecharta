export interface WordListGeometry {
    rowCount: number
    rowHeight: number
    /** How far the list's top has scrolled past the top of the scroll container. */
    scrolledPast: number
    viewportHeight: number
    /** Index of the word whose breakdown is open, or -1 while none is. */
    expandedIndex: number
    /** Measured height of that breakdown, which sits between its row and the next one. */
    expandedHeight: number
}

export interface WordListWindow {
    firstIndex: number
    /** Inclusive. */
    lastIndex: number
    topSpacerHeight: number
    bottomSpacerHeight: number
}

const OVERSCAN_ROWS = 6

/**
 * Which slice of the word list is worth rendering, and how tall the spacers above and below it have to
 * be so the scrollbar still measures the whole list. Rows are uniform, so the only irregularity is the
 * one open breakdown; it is handled as a single block of extra height sitting after its row.
 */
export function wordListWindow(geometry: WordListGeometry): WordListWindow {
    const { rowCount, rowHeight, scrolledPast, viewportHeight, expandedIndex, expandedHeight } = geometry
    if (rowCount === 0 || rowHeight <= 0 || viewportHeight <= 0) {
        return everyRow(geometry)
    }

    const firstIndex = clamp(indexAt(scrolledPast, geometry) - OVERSCAN_ROWS, 0, rowCount - 1)
    const lastIndex = clamp(indexAt(scrolledPast + viewportHeight, geometry) + OVERSCAN_ROWS, firstIndex, rowCount - 1)
    return {
        firstIndex,
        lastIndex,
        topSpacerHeight: offsetOf(firstIndex, geometry),
        bottomSpacerHeight: offsetOf(rowCount, geometry) - offsetOf(lastIndex + 1, geometry)
    }
}

/** Whether a row is fully inside the panel, which the overscan rows around the window are not. */
export function isRowOnScreen(index: number, geometry: WordListGeometry): boolean {
    const rowTop = offsetOf(index, geometry)
    return rowTop >= geometry.scrolledPast && rowTop + geometry.rowHeight <= geometry.scrolledPast + geometry.viewportHeight
}

/** The offset that puts a row in the middle of the panel, the way the file tree reveals a node. */
export function offsetThatCentres(index: number, geometry: WordListGeometry): number {
    return offsetOf(index, geometry) - (geometry.viewportHeight - geometry.rowHeight) / 2
}

function everyRow({ rowCount }: WordListGeometry): WordListWindow {
    return { firstIndex: 0, lastIndex: rowCount - 1, topSpacerHeight: 0, bottomSpacerHeight: 0 }
}

/** How far the top of row [index] sits below the top of the list. Also valid for one past the last row. */
function offsetOf(index: number, { rowHeight, expandedIndex, expandedHeight }: WordListGeometry): number {
    const isBelowTheOpenBreakdown = expandedIndex >= 0 && index > expandedIndex
    return index * rowHeight + (isBelowTheOpenBreakdown ? expandedHeight : 0)
}

/** The row occupying a given offset; inside the open breakdown that is the row it belongs to. */
function indexAt(offset: number, geometry: WordListGeometry): number {
    const { rowHeight, expandedIndex, expandedHeight } = geometry
    const breakdownTop = (expandedIndex + 1) * rowHeight
    if (expandedIndex < 0 || offset < breakdownTop) {
        return Math.floor(offset / rowHeight)
    }
    if (offset < breakdownTop + expandedHeight) {
        return expandedIndex
    }
    return Math.floor((offset - expandedHeight) / rowHeight)
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max)
}
