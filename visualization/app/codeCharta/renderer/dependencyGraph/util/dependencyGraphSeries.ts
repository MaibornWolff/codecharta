/** Painted in this order: open folders at the back, then the level bands, the edges, and on top the files
 * and closed folders, so an edge never covers a box the reader wants to click. */
export const SERIES_IDS = {
    openFolders: "openFolders",
    levels: "levels",
    edges: "edges",
    boxes: "boxes"
} as const

const BOX_SERIES_IDS: ReadonlySet<string> = new Set([SERIES_IDS.openFolders, SERIES_IDS.boxes])

export function isBoxSeries(seriesId: string | undefined): boolean {
    return seriesId !== undefined && BOX_SERIES_IDS.has(seriesId)
}
