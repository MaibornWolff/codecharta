/** Painted in this order: every box and level band in paint order, then the edges above them all. An edge
 * over a box does not take the box's clicks: the host hands them on to the box underneath. */
export const SERIES_IDS = {
    boxes: "boxes",
    edges: "edges"
} as const

export function isBoxSeries(seriesId: string | undefined): boolean {
    return seriesId === SERIES_IDS.boxes
}
