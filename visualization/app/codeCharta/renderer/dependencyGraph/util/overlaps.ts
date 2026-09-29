import { LAYOUT_SPACING, LayoutBox, LevelBand } from "./levelizedLayout"
import { PaintedItem } from "./paintOrder"

/** What a level band leaves out because a box painted over it, from outside its folder, covers it. */
export interface BandCutout {
    /** Stretches of the separator, as [left, right] in layout units, that lie under such a box. */
    hiddenSpans: [number, number][]
    isLabelHidden: boolean
}

export interface Overlaps {
    /** Folders painted over a box they do not belong with; they let it show through. */
    seeThroughPaths: ReadonlySet<string>
    bandCutouts: ReadonlyMap<LevelBand, BandCutout>
}

export const NO_OVERLAPS: Overlaps = { seeThroughPaths: new Set(), bandCutouts: new Map() }

/** Room the "level N" label takes above its band. */
const LEVEL_LABEL_SIZE = { width: 48, height: 12 }

interface Rect {
    x: number
    y: number
    width: number
    height: number
}

export function findOverlaps(items: PaintedItem[]): Overlaps {
    const painted = items.map((item, index) => ({ item, index }))
    const boxes = painted.flatMap(({ item, index }) => (item.kind === "box" ? [{ box: item.box, index }] : []))
    const seeThroughPaths = new Set<string>()
    boxes.forEach(({ box: upper }, upperRank) => {
        if (upper.isFolder && boxes.slice(0, upperRank).some(({ box: lower }) => areUnrelated(upper, lower) && intersect(upper, lower))) {
            seeThroughPaths.add(upper.path)
        }
    })
    const bandCutouts = new Map<LevelBand, BandCutout>()
    for (const { item, index } of painted) {
        if (item.kind === "band") {
            const covering = boxes.filter(({ box, index: boxIndex }) => boxIndex > index && isOutsideFolder(box, item.band.folderPath))
            const cutout = cutoutOf(
                item.band,
                covering.map(({ box }) => box)
            )
            if (cutout.hiddenSpans.length > 0 || cutout.isLabelHidden) {
                bandCutouts.set(item.band, cutout)
            }
        }
    }
    return { seeThroughPaths, bandCutouts }
}

function cutoutOf(band: LevelBand, covering: LayoutBox[]): BandCutout {
    const separatorY = band.y - LAYOUT_SPACING.gapBetweenLevels / 2
    const left = band.x + LAYOUT_SPACING.padding
    const right = band.x + band.width - LAYOUT_SPACING.padding
    const hiddenSpans = band.isTopmost
        ? []
        : covering
              .filter(box => box.y <= separatorY && separatorY <= box.y + box.height && box.x < right && box.x + box.width > left)
              .map((box): [number, number] => [Math.max(left, box.x), Math.min(right, box.x + box.width)])
    const labelRect = { x: left, y: band.y - LEVEL_LABEL_SIZE.height, ...LEVEL_LABEL_SIZE }
    return { hiddenSpans, isLabelHidden: covering.some(box => intersect(box, labelRect)) }
}

function isOutsideFolder(box: LayoutBox, folderPath: string): boolean {
    return box.path !== folderPath && !box.path.startsWith(`${folderPath}/`)
}

function areUnrelated(boxA: LayoutBox, boxB: LayoutBox): boolean {
    return !boxA.path.startsWith(`${boxB.path}/`) && !boxB.path.startsWith(`${boxA.path}/`)
}

function intersect(rectA: Rect, rectB: Rect): boolean {
    return (
        rectA.x < rectB.x + rectB.width &&
        rectB.x < rectA.x + rectA.width &&
        rectA.y < rectB.y + rectB.height &&
        rectB.y < rectA.y + rectA.height
    )
}
