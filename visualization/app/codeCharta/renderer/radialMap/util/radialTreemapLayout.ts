import { HierarchyRectangularNode, hierarchy, treemap, treemapSquarify } from "d3-hierarchy"
import { CENTRE_RADIUS, FULL_TURN, OUTER_RADIUS, ringWidth } from "./radialChartStyle"
import { levelsBelow, RadialNode } from "./radialTree"

export const MAX_BAND_COUNT = 3

const HEADER_SHARE_OF_BAND = 0.15
const MAX_HEADER_THICKNESS = 0.04
const GAP_BETWEEN_BANDS = 0.012

/** Angles in radians, clockwise from twelve o'clock; radii as a share of half the chart's shorter side. */
export interface AnnularSector {
    startAngle: number
    endAngle: number
    innerRadius: number
    outerRadius: number
}

export type SectorRole = "centre" | "header" | "cell" | "outline"

export interface PlacedSector extends AnnularSector {
    role: SectorRole
}

export interface RadialTreemapPlacement {
    node: RadialNode
    isCentre: boolean
    sectors: PlacedSector[]
}

interface Bands {
    count: number
    width: number
    headerThickness: number
}

interface LayoutContext {
    placements: Map<RadialNode, RadialTreemapPlacement>
    bands: Bands
}

export function layOutRadialTreemap(centre: RadialNode): RadialTreemapPlacement[] {
    const context: LayoutContext = { placements: new Map(), bands: bandsAround(centre) }
    context.placements.set(centre, { node: centre, isCentre: true, sectors: [] })
    place(context, centre, { role: "centre", startAngle: 0, endAngle: FULL_TURN, innerRadius: 0, outerRadius: CENTRE_RADIUS })
    placeChildWedges(context, centre, { startAngle: 0, endAngle: FULL_TURN }, 1)
    return [...context.placements.values()]
}

function bandsAround(centre: RadialNode): Bands {
    const count = Math.max(
        1,
        levelsBelow(centre, MAX_BAND_COUNT, child => !child.isFile)
    )
    const width = ringWidth(count)
    return { count, width, headerThickness: Math.min(width * HEADER_SHARE_OF_BAND, MAX_HEADER_THICKNESS) }
}

function placeChildWedges(context: LayoutContext, parent: RadialNode, span: Pick<AnnularSector, "startAngle" | "endAngle">, band: number) {
    if (band > context.bands.count) {
        return
    }
    const innerRadius = CENTRE_RADIUS + (band - 1) * context.bands.width
    const outerRadius = innerRadius + context.bands.width - GAP_BETWEEN_BANDS
    const anglePerArea = (span.endAngle - span.startAngle) / parent.area
    let startAngle = span.startAngle
    for (const slot of wedgeSlots(parent, band)) {
        const wedge = { startAngle, endAngle: startAngle + slot.area * anglePerArea, innerRadius, outerRadius }
        if (slot.folder) {
            placeFolderWedge(context, slot.folder, wedge, band)
        } else {
            placeCells(context, slot.files, { ...wedge, outerRadius: OUTER_RADIUS - GAP_BETWEEN_BANDS })
        }
        startAngle = wedge.endAngle
    }
}

type WedgeSlot = { area: number; folder: RadialNode; files?: never } | { area: number; folder?: never; files: RadialNode[] }

// The centre's own files share one block of cells reaching out to the rim, so they look like every other folder's
// files instead of thin slices; deeper files only show as cells in their parent's wedge.
function wedgeSlots(parent: RadialNode, band: number): WedgeSlot[] {
    const children = largestFirst(parent.children)
    const slots: WedgeSlot[] = children.filter(child => !child.isFile).map(folder => ({ area: folder.area, folder }))
    const files = children.filter(child => child.isFile)
    if (band === 1 && files.length > 0) {
        slots.push({ area: files.reduce((sum, file) => sum + file.area, 0), files })
    }
    return slots.sort((first, second) => second.area - first.area)
}

function placeFolderWedge(context: LayoutContext, folder: RadialNode, wedge: AnnularSector, band: number) {
    const headerOuterRadius = wedge.innerRadius + context.bands.headerThickness
    place(context, folder, { ...wedge, role: "outline" })
    place(context, folder, { ...wedge, outerRadius: headerOuterRadius, role: "header" })
    placeCells(context, folder.children, { ...wedge, innerRadius: headerOuterRadius })
    placeChildWedges(context, folder, wedge, band + 1)
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

function largestFirst(nodes: RadialNode[]): RadialNode[] {
    return [...nodes].sort(compareLargestFirst)
}

function compareLargestFirst(first: RadialNode, second: RadialNode): number {
    return second.area - first.area || first.path.localeCompare(second.path)
}

function place(context: LayoutContext, node: RadialNode, sector: PlacedSector) {
    const placement = context.placements.get(node) ?? { node, isCentre: false, sectors: [] }
    placement.sectors.push(sector)
    context.placements.set(node, placement)
}
