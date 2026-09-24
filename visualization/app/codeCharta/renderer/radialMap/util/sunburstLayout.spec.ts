import { CENTRE_RADIUS, FULL_TURN, OUTER_RADIUS } from "./radialChartStyle"
import { PlacedSector, RadialPlacement } from "./radialPlacement"
import { RadialNode } from "./radialTree"
import { layOutSunburst } from "./sunburstLayout"

function file(path: string, area: number): RadialNode {
    return { path, name: path.split("/").at(-1), isFile: true, area, colorValue: 1, isFlat: false, children: [] }
}

function folder(path: string, children: RadialNode[]): RadialNode {
    const area = children.reduce((sum, child) => sum + child.area, 0)
    return { path, name: path.split("/").at(-1), isFile: false, area, colorValue: 1, isFlat: false, children }
}

function nestedFolders(depth: number, path = "/r"): RadialNode {
    return folder(path, [depth > 0 ? nestedFolders(depth - 1, `${path}/${depth}`) : file(`${path}/a.ts`, 1)])
}

function sectorOf(placements: RadialPlacement[], path: string): PlacedSector {
    const placement = placements.find(candidate => candidate.node.path === path)
    expect(placement.sectors).toHaveLength(1)
    return placement.sectors[0]
}

describe("layOutSunburst", () => {
    it("should put the centre first as a disc and every other node in one ring sector", () => {
        // Arrange
        const centre = folder("/r", [folder("/r/src", [file("/r/src/a.ts", 3)]), file("/r/b.ts", 1)])

        // Act
        const placements = layOutSunburst(centre, 3)

        // Assert
        expect(placements.map(placement => placement.node.path)).toEqual(["/r", "/r/src", "/r/src/a.ts", "/r/b.ts"])
        expect(placements[0]).toMatchObject({ isCentre: true, sectors: [{ role: "centre", innerRadius: 0, outerRadius: CENTRE_RADIUS }] })
        expect(placements.slice(1).every(placement => !placement.isCentre && placement.sectors[0].role === "ring")).toBe(true)
    })

    it("should share a folder's angle among its children by area, the largest first from twelve o'clock", () => {
        // Arrange
        const centre = folder("/r", [file("/r/small.ts", 1), file("/r/big.ts", 3)])

        // Act
        const placements = layOutSunburst(centre, 3)

        // Assert
        expect(sectorOf(placements, "/r/big.ts")).toMatchObject({ startAngle: 0, endAngle: (3 / 4) * FULL_TURN })
        expect(sectorOf(placements, "/r/small.ts")).toMatchObject({ startAngle: (3 / 4) * FULL_TURN, endAngle: FULL_TURN })
    })

    it("should put a folder's children in the next ring, within the folder's angle", () => {
        // Arrange
        const centre = folder("/r", [folder("/r/src", [file("/r/src/a.ts", 1), file("/r/src/b.ts", 1)]), file("/r/c.ts", 2)])

        // Act
        const placements = layOutSunburst(centre, 3)

        // Assert
        const src = sectorOf(placements, "/r/src")
        const firstChild = sectorOf(placements, "/r/src/a.ts")
        expect(firstChild.innerRadius).toBeCloseTo(src.outerRadius)
        expect(firstChild.startAngle).toBe(src.startAngle)
        expect(sectorOf(placements, "/r/src/b.ts").endAngle).toBeCloseTo(src.endAngle)
    })

    it("should show at most the given number of rings and fill the chart with them", () => {
        // Act
        const placements = layOutSunburst(nestedFolders(8), 5)

        // Assert
        const rings = placements.filter(placement => !placement.isCentre)
        expect(rings).toHaveLength(5)
        expect(Math.max(...rings.map(ring => ring.sectors[0].outerRadius))).toBeCloseTo(OUTER_RADIUS)
    })

    it("should widen the rings to fill the chart when the centre has fewer levels below it", () => {
        // Act
        const placements = layOutSunburst(folder("/r", [file("/r/a.ts", 1)]), 3)

        // Assert
        expect(sectorOf(placements, "/r/a.ts")).toMatchObject({ innerRadius: CENTRE_RADIUS, outerRadius: OUTER_RADIUS })
    })
})
