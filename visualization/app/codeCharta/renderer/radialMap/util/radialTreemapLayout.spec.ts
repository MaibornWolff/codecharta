import { CENTRE_RADIUS, OUTER_RADIUS } from "./radialChartStyle"
import { RadialNode } from "./radialTree"
import { AnnularSector, layOutRadialTreemap, RadialTreemapPlacement, SectorRole } from "./radialTreemapLayout"

const FULL_TURN = 2 * Math.PI

function file(path: string, area: number): RadialNode {
    return { path, name: path.split("/").at(-1), isFile: true, area, colorValue: 1, isFlat: false, children: [] }
}

function folder(path: string, children: RadialNode[]): RadialNode {
    const area = children.reduce((sum, child) => sum + child.area, 0)
    return { path, name: path.split("/").at(-1), isFile: false, area, colorValue: 1, isFlat: false, children }
}

function folderThreeLevelsDown(children: RadialNode[]): RadialNode {
    return folder("/r", [folder("/r/1", [folder("/r/1/2", [folder("/r/1/2/3", children)])])])
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
        const centre = folder("/root", [
            folder("/root/small", [file("/root/small/a.ts", 1)]),
            folder("/root/big", [file("/root/big/a.ts", 3)])
        ])

        // Act
        const placements = layOutRadialTreemap(centre)

        // Assert
        const big = onlySectorOf(placements, "/root/big", "outline")
        const small = onlySectorOf(placements, "/root/small", "outline")
        expect(big.startAngle).toBe(0)
        expect(big.endAngle).toBeCloseTo((3 / 4) * FULL_TURN)
        expect(small.startAngle).toBeCloseTo(big.endAngle)
        expect(small.endAngle).toBeCloseTo(FULL_TURN)
    })

    it("should order children of equal area by path so the layout is the same on every run", () => {
        // Arrange
        const centre = folder("/root", [folder("/root/b", [file("/root/b/a.ts", 1)]), folder("/root/a", [file("/root/a/a.ts", 1)])])

        // Act
        const placements = layOutRadialTreemap(centre)

        // Assert
        expect(onlySectorOf(placements, "/root/a", "outline").startAngle).toBe(0)
    })

    it("should draw the centre's own files as cells of one block in the first band, beside the folders", () => {
        // Arrange
        const centre = folder("/root", [
            folder("/root/src", [folder("/root/src/app", [file("/root/src/app/a.ts", 4)])]),
            file("/root/a.ts", 3),
            file("/root/b.ts", 1)
        ])

        // Act
        const placements = layOutRadialTreemap(centre)

        // Assert
        const cells = [onlySectorOf(placements, "/root/a.ts", "cell"), onlySectorOf(placements, "/root/b.ts", "cell")]
        const block = {
            startAngle: Math.min(...cells.map(cell => cell.startAngle)),
            endAngle: Math.max(...cells.map(cell => cell.endAngle)),
            innerRadius: Math.min(...cells.map(cell => cell.innerRadius)),
            outerRadius: Math.max(...cells.map(cell => cell.outerRadius))
        }
        expect(block.startAngle).toBeCloseTo(onlySectorOf(placements, "/root/src", "outline").endAngle)
        expect(block.endAngle).toBeCloseTo(FULL_TURN)
        expect(block.innerRadius).toBeCloseTo(CENTRE_RADIUS)
        expect(block.outerRadius).toBeCloseTo(onlySectorOf(placements, "/root/src", "outline").outerRadius)
        expect(areaOf(cells[0]) + areaOf(cells[1])).toBeCloseTo(areaOf(block))
        expect(areaOf(cells[0]) / areaOf(cells[1])).toBeCloseTo(3)
    })

    it("should give a folder in the outermost band a header strip at the inner edge of its wedge and an outline around it", () => {
        // Arrange
        const centre = folderThreeLevelsDown([file("/r/1/2/3/a.ts", 1)])

        // Act
        const placements = layOutRadialTreemap(centre)

        // Assert
        const outline = onlySectorOf(placements, "/r/1/2/3", "outline")
        const header = onlySectorOf(placements, "/r/1/2/3", "header")
        expect(header.innerRadius).toBe(outline.innerRadius)
        expect(header.outerRadius).toBeGreaterThan(header.innerRadius)
        expect(header.outerRadius).toBeLessThan(outline.outerRadius)
        expect([header.startAngle, header.endAngle]).toEqual([outline.startAngle, outline.endAngle])
    })

    it("should fill an outermost folder's wedge below its header with cells of its children, sized in proportion to their area", () => {
        // Arrange
        const centre = folderThreeLevelsDown([file("/r/1/2/3/a.ts", 3), file("/r/1/2/3/b.ts", 1)])

        // Act
        const placements = layOutRadialTreemap(centre)

        // Assert
        const outline = onlySectorOf(placements, "/r/1/2/3", "outline")
        const header = onlySectorOf(placements, "/r/1/2/3", "header")
        const cells = [onlySectorOf(placements, "/r/1/2/3/a.ts", "cell"), onlySectorOf(placements, "/r/1/2/3/b.ts", "cell")]
        const body = { ...outline, innerRadius: header.outerRadius }
        expect(areaOf(cells[0]) + areaOf(cells[1])).toBeCloseTo(areaOf(body))
        expect(areaOf(cells[0]) / areaOf(cells[1])).toBeCloseTo(3)
    })

    it("should keep every cell inside the body of its outermost parent's wedge", () => {
        // Arrange
        const children = [5, 3, 2, 2, 1, 1, 1].map((area, index) => file(`/r/1/2/3/f${index}.ts`, area))
        const centre = folderThreeLevelsDown(children)

        // Act
        const placements = layOutRadialTreemap(centre)

        // Assert
        const outline = onlySectorOf(placements, "/r/1/2/3", "outline")
        const header = onlySectorOf(placements, "/r/1/2/3", "header")
        for (const child of children) {
            const cell = onlySectorOf(placements, child.path, "cell")
            expect(cell.startAngle).toBeGreaterThanOrEqual(outline.startAngle - TOLERANCE)
            expect(cell.endAngle).toBeLessThanOrEqual(outline.endAngle + TOLERANCE)
            expect(cell.innerRadius).toBeGreaterThanOrEqual(header.outerRadius - TOLERANCE)
            expect(cell.outerRadius).toBeLessThanOrEqual(outline.outerRadius + TOLERANCE)
        }
    })

    it("should show a file only once, as a cell", () => {
        // Arrange
        const centre = folder("/root", [
            folder("/root/src", [folder("/root/src/app", [file("/root/src/app/a.ts", 1)]), file("/root/src/b.ts", 1)])
        ])

        // Act
        const placements = layOutRadialTreemap(centre)

        // Assert
        expect(placements.find(placement => placement.node.path === "/root/src/b.ts").sectors).toEqual([
            expect.objectContaining({ role: "cell" })
        ])
    })

    it("should draw a folder with a band beyond it as one piece across its band, its children one band further out", () => {
        // Arrange
        const centre = folder("/root", [folder("/root/src", [file("/root/src/a.ts", 1)])])

        // Act
        const placements = layOutRadialTreemap(centre)

        // Assert
        const outline = onlySectorOf(placements, "/root/src", "outline")
        expect(onlySectorOf(placements, "/root/src", "header")).toEqual({ ...outline, role: "header" })
        expect(sectorsOf(placements, "/root/src", "cell")).toHaveLength(0)
        expect(onlySectorOf(placements, "/root/src/a.ts", "cell").innerRadius).toBeGreaterThan(outline.outerRadius)
    })

    it("should put a folder's own files in the next band in their share of its angle, beside its sub-folder", () => {
        // Arrange
        const centre = folder("/root", [
            folder("/root/a", [folder("/root/a/sub", [file("/root/a/sub/s.ts", 2)]), file("/root/a/b.ts", 1), file("/root/a/c.ts", 1)])
        ])

        // Act
        const placements = layOutRadialTreemap(centre)

        // Assert
        const parent = onlySectorOf(placements, "/root/a", "outline")
        const subFolder = onlySectorOf(placements, "/root/a/sub", "outline")
        const fileCells = ["/root/a/b.ts", "/root/a/c.ts"].map(path => onlySectorOf(placements, path, "cell"))
        expect(subFolder.innerRadius).toBeGreaterThan(parent.outerRadius)
        expect(subFolder.endAngle).toBeCloseTo(FULL_TURN / 2)
        for (const cell of fileCells) {
            expect(cell.startAngle).toBeGreaterThanOrEqual(subFolder.endAngle - TOLERANCE)
            expect(cell.innerRadius).toBeCloseTo(subFolder.innerRadius)
            expect(cell.outerRadius).toBeLessThanOrEqual(subFolder.outerRadius + TOLERANCE)
        }
    })

    it("should use one band per level below the centre, files included, sharing the space out to the rim", () => {
        // Arrange
        const centre = folder("/root", [folder("/root/src", [file("/root/src/a.ts", 1)])])

        // Act
        const placements = layOutRadialTreemap(centre)

        // Assert
        const firstBand = onlySectorOf(placements, "/root/src", "outline")
        const secondBand = onlySectorOf(placements, "/root/src/a.ts", "cell")
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
