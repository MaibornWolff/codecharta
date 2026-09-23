import { HierarchyRectangularNode, hierarchy, treemap, treemapSquarify } from "d3-hierarchy"
import { CENTRE_RADIUS, OUTER_RADIUS } from "./radialChartStyle"
import { RadialNode } from "./radialTree"

export const MAX_BAND_COUNT = 3

const FULL_TURN = 2 * Math.PI
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

export type SectorRole = "centre" | "header" | "wedge" | "cell" | "outline"

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
    const count = Math.max(1, deepestFolderLevel(centre, MAX_BAND_COUNT))
    const width = (OUTER_RADIUS - CENTRE_RADIUS) / count
    return { count, width, headerThickness: Math.min(width * HEADER_SHARE_OF_BAND, MAX_HEADER_THICKNESS) }
}

function deepestFolderLevel(folder: RadialNode, levelsLeft: number): number {
    if (levelsLeft === 0) {
        return 0
    }
    return folder.children
        .filter(child => !child.isFile)
        .reduce((deepest, child) => Math.max(deepest, 1 + deepestFolderLevel(child, levelsLeft - 1)), 0)
}

function placeChildWedges(context: LayoutContext, parent: RadialNode, span: Pick<AnnularSector, "startAngle" | "endAngle">, band: number) {
    if (band > context.bands.count) {
        return
    }
    const innerRadius = CENTRE_RADIUS + (band - 1) * context.bands.width
    const outerRadius = innerRadius + context.bands.width - GAP_BETWEEN_BANDS
    const anglePerArea = (span.endAngle - span.startAngle) / parent.area
    let startAngle = span.startAngle
    for (const child of largestFirst(parent.children)) {
        const wedge = { startAngle, endAngle: startAngle + child.area * anglePerArea, innerRadius, outerRadius }
        if (!child.isFile) {
            placeFolderWedge(context, child, wedge, band)
        } else if (band === 1) {
            place(context, child, { ...wedge, role: "wedge" })
        }
        startAngle = wedge.endAngle
    }
}

function placeFolderWedge(context: LayoutContext, folder: RadialNode, wedge: AnnularSector, band: number) {
    const headerOuterRadius = wedge.innerRadius + context.bands.headerThickness
    place(context, folder, { ...wedge, role: "outline" })
    place(context, folder, { ...wedge, outerRadius: headerOuterRadius, role: "header" })
    for (const cell of squarify(folder, { ...wedge, innerRadius: headerOuterRadius })) {
        place(context, cell.node, { ...cell.sector, role: "cell" })
    }
    placeChildWedges(context, folder, wedge, band + 1)
}

function squarify(folder: RadialNode, body: AnnularSector): { node: RadialNode; sector: AnnularSector }[] {
    const arcLength = ((body.endAngle - body.startAngle) * (body.innerRadius + body.outerRadius)) / 2
    const thickness = body.outerRadius - body.innerRadius
    const root = hierarchy(folder, node => (node === folder ? node.children : undefined))
        .sum(node => (node === folder ? 0 : node.area))
        .sort((a, b) => compareLargestFirst(a.data, b.data))
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

function compareLargestFirst(a: RadialNode, b: RadialNode): number {
    return b.area - a.area || a.path.localeCompare(b.path)
}

function place(context: LayoutContext, node: RadialNode, sector: PlacedSector) {
    const placement = context.placements.get(node) ?? { node, isCentre: false, sectors: [] }
    placement.sectors.push(sector)
    context.placements.set(node, placement)
}
