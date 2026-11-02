export interface ListGeometry {
    rowCount: number
    rowHeight: number
    /** How far the list's top has scrolled past the top of the scroll container. */
    scrolledPast: number
    viewportHeight: number
}

export interface ListWindow {
    firstIndex: number
    /** Inclusive. */
    lastIndex: number
    topSpacerHeight: number
    bottomSpacerHeight: number
}

const OVERSCAN_ROWS = 6

/** How much to render before the viewport is measured, which cannot happen until the list is on screen. */
const UNMEASURED_ROWS = 50

/**
 * Which slice of a long list is worth rendering, and how tall the spacers above and below it have to
 * be so the scrollbar still measures the whole list. Every row has to be the same height.
 */
export function listWindow(geometry: ListGeometry): ListWindow {
    const { rowCount, rowHeight, scrolledPast, viewportHeight } = geometry
    if (rowCount === 0) {
        return everyRow(geometry)
    }
    if (rowHeight <= 0 || viewportHeight <= 0) {
        return firstRows(geometry)
    }

    const firstIndex = clamp(Math.floor(scrolledPast / rowHeight) - OVERSCAN_ROWS, 0, rowCount - 1)
    const lastIndex = clamp(Math.floor((scrolledPast + viewportHeight) / rowHeight) + OVERSCAN_ROWS, firstIndex, rowCount - 1)
    return {
        firstIndex,
        lastIndex,
        topSpacerHeight: firstIndex * rowHeight,
        bottomSpacerHeight: (rowCount - lastIndex - 1) * rowHeight
    }
}

function everyRow({ rowCount }: ListGeometry): ListWindow {
    return { firstIndex: 0, lastIndex: rowCount - 1, topSpacerHeight: 0, bottomSpacerHeight: 0 }
}

function firstRows({ rowCount, rowHeight }: ListGeometry): ListWindow {
    const lastIndex = Math.min(UNMEASURED_ROWS, rowCount) - 1
    return {
        firstIndex: 0,
        lastIndex,
        topSpacerHeight: 0,
        bottomSpacerHeight: (rowCount - lastIndex - 1) * Math.max(rowHeight, 0)
    }
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max)
}
