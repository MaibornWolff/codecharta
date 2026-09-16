export interface WordListGeometry {
    rowCount: number
    rowHeight: number
    /** How far the list's top has scrolled past the top of the scroll container. */
    scrolledPast: number
    viewportHeight: number
}

export interface WordListWindow {
    firstIndex: number
    /** Inclusive. */
    lastIndex: number
    topSpacerHeight: number
    bottomSpacerHeight: number
}

const OVERSCAN_ROWS = 6

/** How much of the list to render before it has been measured. The viewport is always unmeasured on the
 * very first render: the scroll host only exists once the word list is on screen, and it is measured in
 * an effect that runs after that render. Rendering the whole list instead would build one row per word
 * in the project, which a large vocabulary makes cost seconds before the first measurement corrects it. */
const UNMEASURED_ROWS = 50

/**
 * Which slice of the word list is worth rendering, and how tall the spacers above and below it have to
 * be so the scrollbar still measures the whole list. Every row is the same height: the word that is
 * open is not among them, it sits in the pin above the list.
 */
export function wordListWindow(geometry: WordListGeometry): WordListWindow {
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

function everyRow({ rowCount }: WordListGeometry): WordListWindow {
    return { firstIndex: 0, lastIndex: rowCount - 1, topSpacerHeight: 0, bottomSpacerHeight: 0 }
}

function firstRows({ rowCount, rowHeight }: WordListGeometry): WordListWindow {
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
