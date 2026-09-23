import { RadialNode } from "./radialTree"
import { AnnularSector, CENTRE_RADIUS, layOutRadialTreemap, OUTER_RADIUS, RadialTreemapPlacement, SectorRole } from "./radialTreemapLayout"

const FULL_TURN = 2 * Math.PI

function file(path: string, area: number): RadialNode {
    return { path, name: path.split("/").at(-1), isFile: true, area, colorValue: 1, isFlat: false, children: [] }
}

function folder(path: string, children: RadialNode[]): RadialNode {
    const area = children.reduce((sum, child) => sum + child.area, 0)
    return { path, name: path.split("/").at(-1), isFile: false, area, colorValue: 1, isFlat: false, children }
}

function sectorsOf(placements: RadialTreemapPlacement[], path: string, role: SectorRole): AnnularSector[] {
    return placements.find(placement => placement.node.path === path)?.sectors.filter(sector => sector.role === role) ?? []
}

function onlySectorOf(placements: RadialTreemapPlacement[], path: string, role: SectorRole): AnnularSector {
    const sectors = sectorsOf(placements, path, role)
    expect(sectors).toHaveLength(1)
    return sectors[0]
}

function areaOf(sector: AnnularSector): number {
    return ((sector.endAngle - sector.startAngle) * (sector.outerRadius ** 2 - sector.innerRadius ** 2)) / 2
}

const TOLERANCE = 1e-9

describe("layOutRadialTreemap", () => {
    it("should place the centre as a full disc inside the centre radius", () => {
        // Arrange
        const centre = folder("/root", [file("/root/a.ts", 1)])

        // Act
        const placements = layOutRadialTreemap(centre)

        // Assert
        expect(placements[0].isCentre).toBe(true)
        expect(onlySectorOf(placements, "/root", "centre")).toEqual({
            role: "centre",
            startAngle: 0,
            endAngle: FULL_TURN,
            innerRadius: 0,
            outerRadius: CENTRE_RADIUS
        })
    })

    it("should give the centre's children angles in proportion to their area, largest first from the top", () => {
        // Arrange
        const centre = folder("/root", [file("/root/small.ts", 1), file("/root/big.ts", 3)])

        // Act
        const placements = layOutRadialTreemap(centre)

        // Assert
        const big = onlySectorOf(placements, "/root/big.ts", "wedge")
        const small = onlySectorOf(placements, "/root/small.ts", "wedge")
        expect(big.startAngle).toBe(0)
        expect(big.endAngle).toBeCloseTo((3 / 4) * FULL_TURN)
        expect(small.startAngle).toBeCloseTo(big.endAngle)
        expect(small.endAngle).toBeCloseTo(FULL_TURN)
    })

    it("should order children of equal area by path so the layout is the same on every run", () => {
        // Arrange
        const centre = folder("/root", [file("/root/b.ts", 1), file("/root/a.ts", 1)])

        // Act
        const placements = layOutRadialTreemap(centre)

        // Assert
        expect(onlySectorOf(placements, "/root/a.ts", "wedge").startAngle).toBe(0)
    })

    it("should draw a file next to the centre as a single wedge across the whole band", () => {
        // Arrange
        const centre = folder("/root", [file("/root/a.ts", 1)])

        // Act
        const placements = layOutRadialTreemap(centre)

        // Assert
        const wedge = onlySectorOf(placements, "/root/a.ts", "wedge")
        expect(wedge.innerRadius).toBe(CENTRE_RADIUS)
        expect(wedge.outerRadius).toBeLessThan(OUTER_RADIUS)
        expect(wedge.outerRadius).toBeGreaterThan(OUTER_RADIUS - 0.05)
    })

    it("should give a folder a header strip at the inner edge of its wedge and an outline around the wedge", () => {
        // Arrange
        const centre = folder("/root", [folder("/root/src", [file("/root/src/a.ts", 1)])])

        // Act
        const placements = layOutRadialTreemap(centre)

        // Assert
        const outline = onlySectorOf(placements, "/root/src", "outline")
        const header = onlySectorOf(placements, "/root/src", "header")
        expect(header.innerRadius).toBe(outline.innerRadius)
        expect(header.outerRadius).toBeGreaterThan(header.innerRadius)
        expect(header.outerRadius).toBeLessThan(outline.outerRadius)
        expect([header.startAngle, header.endAngle]).toEqual([outline.startAngle, outline.endAngle])
    })

    it("should fill a folder's wedge below its header with cells of its children, sized in proportion to their area", () => {
        // Arrange
        const centre = folder("/root", [folder("/root/src", [file("/root/src/a.ts", 3), file("/root/src/b.ts", 1)])])

        // Act
        const placements = layOutRadialTreemap(centre)

        // Assert
        const outline = onlySectorOf(placements, "/root/src", "outline")
        const header = onlySectorOf(placements, "/root/src", "header")
        const cells = [onlySectorOf(placements, "/root/src/a.ts", "cell"), onlySectorOf(placements, "/root/src/b.ts", "cell")]
        const body = { ...outline, innerRadius: header.outerRadius }
        expect(areaOf(cells[0]) + areaOf(cells[1])).toBeCloseTo(areaOf(body))
        expect(areaOf(cells[0]) / areaOf(cells[1])).toBeCloseTo(3)
    })

    it("should keep every cell inside the body of its parent's wedge", () => {
        // Arrange
        const children = [5, 3, 2, 2, 1, 1, 1].map((area, index) => file(`/root/src/f${index}.ts`, area))
        const centre = folder("/root", [folder("/root/src", children), file("/root/big.ts", 20)])

        // Act
        const placements = layOutRadialTreemap(centre)

        // Assert
        const outline = onlySectorOf(placements, "/root/src", "outline")
        const header = onlySectorOf(placements, "/root/src", "header")
        for (const child of children) {
            const cell = onlySectorOf(placements, child.path, "cell")
            expect(cell.startAngle).toBeGreaterThanOrEqual(outline.startAngle - TOLERANCE)
            expect(cell.endAngle).toBeLessThanOrEqual(outline.endAngle + TOLERANCE)
            expect(cell.innerRadius).toBeGreaterThanOrEqual(header.outerRadius - TOLERANCE)
            expect(cell.outerRadius).toBeLessThanOrEqual(outline.outerRadius + TOLERANCE)
        }
    })

    it("should show a file below the first band only as a cell, not as a wedge of its own", () => {
        // Arrange
        const centre = folder("/root", [
            folder("/root/src", [folder("/root/src/app", [file("/root/src/app/a.ts", 1)]), file("/root/src/b.ts", 1)])
        ])

        // Act
        const placements = layOutRadialTreemap(centre)

        // Assert
        expect(sectorsOf(placements, "/root/src/b.ts", "cell")).toHaveLength(1)
        expect(sectorsOf(placements, "/root/src/b.ts", "wedge")).toHaveLength(0)
    })

    it("should give a sub-folder both a cell in its parent's wedge and a wedge of its own in the next band", () => {
        // Arrange
        const centre = folder("/root", [folder("/root/src", [folder("/root/src/app", [file("/root/src/app/a.ts", 1)])])])

        // Act
        const placements = layOutRadialTreemap(centre)

        // Assert
        const parentOutline = onlySectorOf(placements, "/root/src", "outline")
        expect(onlySectorOf(placements, "/root/src/app", "cell").outerRadius).toBeCloseTo(parentOutline.outerRadius)
        expect(onlySectorOf(placements, "/root/src/app", "header").innerRadius).toBeGreaterThan(parentOutline.outerRadius)
    })

    it("should use one band per folder level below the centre", () => {
        // Arrange
        const centre = folder("/root", [folder("/root/src", [folder("/root/src/app", [file("/root/src/app/a.ts", 1)])])])

        // Act
        const placements = layOutRadialTreemap(centre)

        // Assert
        const firstBand = onlySectorOf(placements, "/root/src", "outline")
        const secondBand = onlySectorOf(placements, "/root/src/app", "outline")
        expect(firstBand.innerRadius).toBe(CENTRE_RADIUS)
        expect(secondBand.innerRadius).toBeCloseTo((CENTRE_RADIUS + OUTER_RADIUS) / 2)
        expect(secondBand.outerRadius).toBeGreaterThan(OUTER_RADIUS - 0.05)
    })

    it("should draw at most three bands and show the folders of a fourth level only as cells", () => {
        // Arrange
        const level4 = folder("/r/1/2/3/4", [file("/r/1/2/3/4/a.ts", 1)])
        const centre = folder("/r", [folder("/r/1", [folder("/r/1/2", [folder("/r/1/2/3", [level4])])])])

        // Act
        const placements = layOutRadialTreemap(centre)

        // Assert
        expect(sectorsOf(placements, "/r/1/2/3", "outline")).toHaveLength(1)
        expect(sectorsOf(placements, level4.path, "cell")).toHaveLength(1)
        expect(sectorsOf(placements, level4.path, "outline")).toHaveLength(0)
        expect(placements.some(placement => placement.node.path === "/r/1/2/3/4/a.ts")).toBe(false)
    })

    it("should list every node once, the centre first", () => {
        // Arrange
        const centre = folder("/root", [folder("/root/src", [folder("/root/src/app", [file("/root/src/app/a.ts", 1)])])])

        // Act
        const placements = layOutRadialTreemap(centre)

        // Assert
        expect(placements.map(placement => placement.node.path)).toEqual(["/root", "/root/src", "/root/src/app", "/root/src/app/a.ts"])
        expect(placements.filter(placement => placement.isCentre)).toHaveLength(1)
    })
})
