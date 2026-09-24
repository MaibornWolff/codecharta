import { HierarchyRectangularNode, hierarchy, treemap, treemapSquarify } from "d3-hierarchy"
import { CENTRE_RADIUS, ringWidth } from "./radialChartStyle"
import {
    AngularSpan,
    AnnularSector,
    CENTRE_SECTOR,
    compareLargestFirst,
    FULL_CIRCLE,
    largestFirst,
    PlacedSector,
    RadialPlacement
} from "./radialPlacement"
import { levelsBelow, RadialNode } from "./radialTree"

const HEADER_SHARE_OF_BAND = 0.15
const MAX_HEADER_THICKNESS = 0.04
const GAP_BETWEEN_BANDS = 0.012

interface Bands {
    count: number
    width: number
    headerThickness: number
}

interface LayoutContext {
    placements: Map<RadialNode, RadialPlacement>
    bands: Bands
}

export function layOutRadialTreemap(centre: RadialNode, maxBandCount: number): RadialPlacement[] {
    const context: LayoutContext = { placements: new Map(), bands: bandsAround(centre, maxBandCount) }
    context.placements.set(centre, { node: centre, isCentre: true, sectors: [] })
    place(context, centre, CENTRE_SECTOR)
    placeChildren(context, centre, FULL_CIRCLE, 1)
    return [...context.placements.values()]
}

function bandsAround(centre: RadialNode, maxBandCount: number): Bands {
    const count = Math.max(1, levelsBelow(centre, maxBandCount))
    const width = ringWidth(count)
    return { count, width, headerThickness: Math.min(width * HEADER_SHARE_OF_BAND, MAX_HEADER_THICKNESS) }
}

// As in the sunburst, a folder's children sit one band further out, each in its own share of the folder's angle:
// the files as one block of cells, every sub-folder as a wedge whose children continue in the band after.
function placeChildren(context: LayoutContext, parent: RadialNode, span: AngularSpan, band: number) {
    const anglePerArea = (span.endAngle - span.startAngle) / parent.area
    let startAngle = span.startAngle
    for (const slot of childSlots(parent)) {
        const share = bandSector(context, { startAngle, endAngle: startAngle + slot.area * anglePerArea }, band)
        if (slot.folder) {
            placeFolderWedge(context, slot.folder, share, band)
        } else {
            placeCells(context, slot.files, share)
        }
        startAngle = share.endAngle
    }
}

type ChildSlot = { area: number; folder: RadialNode; files?: never } | { area: number; folder?: never; files: RadialNode[] }

function childSlots(parent: RadialNode): ChildSlot[] {
    const children = largestFirst(parent.children)
    const slots: ChildSlot[] = children.filter(child => !child.isFile).map(folder => ({ area: folder.area, folder }))
    const files = children.filter(child => child.isFile)
    if (files.length > 0) {
        slots.push({ area: files.reduce((sum, file) => sum + file.area, 0), files })
    }
    return slots.sort((first, second) => second.area - first.area)
}

function bandSector(context: LayoutContext, span: AngularSpan, band: number): AnnularSector {
    const innerRadius = CENTRE_RADIUS + (band - 1) * context.bands.width
    return {
        startAngle: span.startAngle,
        endAngle: span.endAngle,
        innerRadius,
        outerRadius: innerRadius + context.bands.width - GAP_BETWEEN_BANDS
    }
}

// Only the outermost band has no band beyond it, so its folders show their contents as a treemap below a header.
function placeFolderWedge(context: LayoutContext, folder: RadialNode, wedge: AnnularSector, band: number) {
    place(context, folder, { ...wedge, role: "outline" })
    if (band < context.bands.count) {
        place(context, folder, { ...wedge, role: "header" })
        placeChildren(context, folder, wedge, band + 1)
        return
    }
    const body = { ...wedge, innerRadius: wedge.innerRadius + context.bands.headerThickness }
    place(context, folder, { ...wedge, outerRadius: body.innerRadius, role: "header" })
    placeCells(context, folder.children, body)
}

function placeCells(context: LayoutContext, nodes: RadialNode[], body: AnnularSector) {
    for (const cell of squarify(nodes, body)) {
        place(context, cell.node, { ...cell.sector, role: "cell" })
    }
}

function squarify(nodes: RadialNode[], body: AnnularSector): { node: RadialNode; sector: AnnularSector }[] {
    const arcLength = ((body.endAngle - body.startAngle) * (body.innerRadius + body.outerRadius)) / 2
    const thickness = body.outerRadius - body.innerRadius
    const group: RadialNode = { path: "", name: "", isFile: false, area: 0, colorValue: undefined, isFlat: false, children: nodes }
    const root = hierarchy(group, node => (node === group ? node.children : undefined))
        .sum(node => (node === group ? 0 : node.area))
        .sort((first, second) => compareLargestFirst(first.data, second.data))
    const tiled = treemap<RadialNode>().tile(treemapSquarify).size([arcLength, thickness])(root)
    return tiled.children.map(cell => ({ node: cell.data, sector: bendIntoBody(cell, body, arcLength, thickness) }))
}

// Rows of cells stack outwards, and a ring gets wider further out; taking the radius from the square root keeps
// each cell's area in proportion to its node.
function bendIntoBody(cell: HierarchyRectangularNode<RadialNode>, body: AnnularSector, arcLength: number, thickness: number) {
    const angularSpan = body.endAngle - body.startAngle
    const radiusAt = (depthIntoBody: number) =>
        Math.sqrt(body.innerRadius ** 2 + (depthIntoBody / thickness) * (body.outerRadius ** 2 - body.innerRadius ** 2))
    return {
        startAngle: body.startAngle + (cell.x0 / arcLength) * angularSpan,
        endAngle: body.startAngle + (cell.x1 / arcLength) * angularSpan,
        innerRadius: radiusAt(cell.y0),
        outerRadius: radiusAt(cell.y1)
    }
}

function place(context: LayoutContext, node: RadialNode, sector: PlacedSector) {
    const placement = context.placements.get(node) ?? { node, isCentre: false, sectors: [] }
    placement.sectors.push(sector)
    context.placements.set(node, placement)
}
