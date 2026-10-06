import { IsInside } from "./boxNesting"
import { enclosingRectangle, intersects, Rectangle } from "./geometry"
import { canBeOpened, LAYOUT_SPACING, LayoutBox, LevelBand } from "./layoutModel"
import { PaintedItem } from "./paintOrder"
import { RectangleGrid } from "./rectangleGrid"

/** What a level band leaves out because a box painted over it, from outside its folder, covers it. */
export interface BandCutout {
    /** Stretches of the separator, as [left, right] in layout units. */
    hiddenSpans: [number, number][]
    isLabelHidden: boolean
}

export interface Overlaps {
    /** Folders painted over a box they do not belong with; they let it show through. */
    seeThroughPaths: ReadonlySet<string>
    bandCutouts: ReadonlyMap<LevelBand, BandCutout>
}

export interface BandSeparator {
    left: number
    right: number
    y: number
}

export const NO_OVERLAPS: Overlaps = { seeThroughPaths: new Set(), bandCutouts: new Map() }

const LEVEL_LABEL_SIZE = { width: 48, height: 12 }

interface PaintedBox {
    box: LayoutBox
    paintIndex: number
}

type PaintedBoxGrid = RectangleGrid<PaintedBox>

export function findOverlaps(items: PaintedItem[], isInside: IsInside): Overlaps {
    const boxes = items.flatMap((item, paintIndex) => (item.kind === "box" ? [{ box: item.box, paintIndex }] : []))
    const grid = new RectangleGrid(boxes, ({ box }) => box)
    return { seeThroughPaths: seeThroughContainers(boxes, grid, isInside), bandCutouts: bandCutoutsOf(items, grid, isInside) }
}

export function bandSeparator(band: LevelBand): BandSeparator {
    return {
        left: band.x + LAYOUT_SPACING.padding,
        right: band.x + band.width - LAYOUT_SPACING.padding,
        y: band.y - LAYOUT_SPACING.gapBetweenLevels / 2
    }
}

function seeThroughContainers(boxes: PaintedBox[], grid: PaintedBoxGrid, isInside: IsInside): Set<string> {
    const seeThroughPaths = new Set<string>()
    for (const upper of boxes) {
        if (canBeOpened(upper.box) && grid.itemsNear(upper.box).some(lower => isPaintedOverUnrelated(upper, lower, isInside))) {
            seeThroughPaths.add(upper.box.path)
        }
    }
    return seeThroughPaths
}

function isPaintedOverUnrelated(upper: PaintedBox, lower: PaintedBox, isInside: IsInside): boolean {
    const areUnrelated = !isInside(upper.box.path, lower.box.path) && !isInside(lower.box.path, upper.box.path)
    return lower.paintIndex < upper.paintIndex && areUnrelated && intersects(upper.box, lower.box)
}

function bandCutoutsOf(items: PaintedItem[], grid: PaintedBoxGrid, isInside: IsInside): Map<LevelBand, BandCutout> {
    const bandCutouts = new Map<LevelBand, BandCutout>()
    items.forEach((item, paintIndex) => {
        if (item.kind !== "band") {
            return
        }
        const paintedOver = boxesPaintedOver(item.band, paintIndex, grid).filter(box => !isInside(box.path, item.band.containerPath))
        const cutout = cutoutOf(item.band, paintedOver)
        if (cutout.hiddenSpans.length > 0 || cutout.isLabelHidden) {
            bandCutouts.set(item.band, cutout)
        }
    })
    return bandCutouts
}

function boxesPaintedOver(band: LevelBand, bandPaintIndex: number, grid: PaintedBoxGrid): LayoutBox[] {
    const separator = bandSeparator(band)
    const separatorLine = { x: separator.left, y: separator.y, width: separator.right - separator.left, height: 0 }
    return grid
        .itemsNear(enclosingRectangle([separatorLine, labelRectangleOf(band)]))
        .filter(({ paintIndex }) => paintIndex > bandPaintIndex)
        .sort((boxA, boxB) => boxA.paintIndex - boxB.paintIndex)
        .map(({ box }) => box)
}

function cutoutOf(band: LevelBand, covering: LayoutBox[]): BandCutout {
    const { left, right, y } = bandSeparator(band)
    const hiddenSpans = band.isTopmost
        ? []
        : covering
              .filter(box => box.y <= y && y <= box.y + box.height && box.x < right && box.x + box.width > left)
              .map((box): [number, number] => [Math.max(left, box.x), Math.min(right, box.x + box.width)])
    const labelRectangle = labelRectangleOf(band)
    return { hiddenSpans, isLabelHidden: covering.some(box => intersects(box, labelRectangle)) }
}

function labelRectangleOf(band: LevelBand): Rectangle {
    return { x: bandSeparator(band).left, y: band.y - LEVEL_LABEL_SIZE.height, ...LEVEL_LABEL_SIZE }
}
