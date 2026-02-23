import { CodeMapGeometricDescription } from "./codeMapGeometricDescription"
import { CodeMapBuilding } from "./codeMapBuilding"
import { Box3, Ray, Vector3 } from "three"
import { Node } from "../../../codeCharta.model"

function makeBuilding(id: number, minX: number, minZ: number, maxX: number, maxZ: number, height = 10): CodeMapBuilding {
    const box = new Box3(new Vector3(minX, 0, minZ), new Vector3(maxX, height, maxZ))
    const node = {
        path: `/root/file${id}`,
        name: `file${id}`,
        id,
        width: maxX - minX,
        height,
        length: maxZ - minZ,
        x0: minX,
        y0: minZ,
        z0: 0,
        isLeaf: true
    } as unknown as Node
    return new CodeMapBuilding(id, box, node, "#ff0000")
}

function linearIntersect(desc: CodeMapGeometricDescription, ray: Ray): CodeMapBuilding | undefined {
    let closest: CodeMapBuilding | undefined
    let closestDist = Number.POSITIVE_INFINITY
    const target = new Vector3()

    for (const building of desc.buildings) {
        const result = ray.intersectBox(building.boundingBox, target)
        if (result) {
            const distance = result.distanceTo(ray.origin)
            if (distance < closestDist) {
                closestDist = distance
                closest = building
            }
        }
    }
    return closest
}

describe("CodeMapGeometricDescription", () => {
    describe("intersect with BVH", () => {
        it("should return undefined for empty description", () => {
            // Arrange
            const desc = new CodeMapGeometricDescription(0)
            desc.setScales({ x: 1, y: 1, z: 1 })
            const ray = new Ray(new Vector3(0, 100, 0), new Vector3(0, -1, 0))

            // Act
            const result = desc.intersect(ray)

            // Assert
            expect(result).toBeUndefined()
        })

        it("should find a single building", () => {
            // Arrange
            const desc = new CodeMapGeometricDescription(0)
            const building = makeBuilding(0, 0, 0, 10, 10)
            desc.add(building)
            desc.setScales({ x: 1, y: 1, z: 1 })

            const ray = new Ray(new Vector3(5, 100, 5), new Vector3(0, -1, 0))

            // Act
            const result = desc.intersect(ray)

            // Assert
            expect(result).toBe(building)
        })

        it("should return undefined when ray misses all buildings", () => {
            // Arrange
            const desc = new CodeMapGeometricDescription(0)
            desc.add(makeBuilding(0, 0, 0, 10, 10))
            desc.setScales({ x: 1, y: 1, z: 1 })

            const ray = new Ray(new Vector3(50, 100, 50), new Vector3(0, -1, 0))

            // Act
            const result = desc.intersect(ray)

            // Assert
            expect(result).toBeUndefined()
        })

        it("should return the closest building when ray hits multiple", () => {
            // Arrange
            const desc = new CodeMapGeometricDescription(0)
            const tallBuilding = makeBuilding(0, 0, 0, 10, 10, 50)
            const shortBuilding = makeBuilding(1, 0, 0, 10, 10, 10)
            desc.add(shortBuilding)
            desc.add(tallBuilding)
            desc.setScales({ x: 1, y: 1, z: 1 })

            const ray = new Ray(new Vector3(5, 100, 5), new Vector3(0, -1, 0))

            // Act
            const result = desc.intersect(ray)

            // Assert
            expect(result).toBe(tallBuilding)
        })

        it("should handle zero-height buildings", () => {
            // Arrange
            const desc = new CodeMapGeometricDescription(0)
            const building = makeBuilding(0, 0, 0, 10, 10, 0)
            desc.add(building)
            desc.setScales({ x: 1, y: 1, z: 1 })

            const ray = new Ray(new Vector3(5, 100, 5), new Vector3(0, -1, 0))

            // Act
            const result = desc.intersect(ray)

            // Assert - a vertical ray through (5,100,5) aimed at a flat box covering x=[0,10],z=[0,10]
            // at y=0 always intersects: the slab test yields tEnter=tExit=100 and Three.js
            // intersectBox returns (5,0,5), so the building is found
            expect(result).toBe(building)
        })

        it("should return the exact building at a known grid position when cast from above", () => {
            // Arrange
            // 100 buildings arranged in a 10x10 grid: building i occupies
            //   x = [(i%10)*12 , (i%10)*12+10]
            //   z = [floor(i/10)*12 , floor(i/10)*12+10]
            //   height = 5 + (i % 20)
            // mapSize=0 and scale=(1,1,1) so scaledBox == originalBox with no translation.
            const desc = new CodeMapGeometricDescription(0)
            const buildings: CodeMapBuilding[] = []
            for (let i = 0; i < 100; i++) {
                const x = (i % 10) * 12
                const z = Math.floor(i / 10) * 12
                const b = makeBuilding(i, x, z, x + 10, z + 10, 5 + (i % 20))
                buildings.push(b)
                desc.add(b)
            }
            desc.setScales({ x: 1, y: 1, z: 1 })

            // building 0:  x=[0,10],   z=[0,10],   height=5  — ray (5,100,5)
            // building 22: x=[24,34],  z=[24,34],  height=7  — ray (25,100,25)  (i=2+2*10=22)
            // building 44: x=[48,58],  z=[48,58],  height=9  — ray (55,100,55)  (i=4+4*10=44)
            // building 99: x=[108,118],z=[108,118],height=24 — ray (115,100,115) (i=9+9*10=99)
            // no building covers x=-10,z=-10, so that ray returns undefined

            // Act & Assert
            expect(desc.intersect(new Ray(new Vector3(5, 100, 5), new Vector3(0, -1, 0)))).toBe(buildings[0])
            expect(desc.intersect(new Ray(new Vector3(25, 100, 25), new Vector3(0, -1, 0)))).toBe(buildings[22])
            expect(desc.intersect(new Ray(new Vector3(55, 100, 55), new Vector3(0, -1, 0)))).toBe(buildings[44])
            expect(desc.intersect(new Ray(new Vector3(115, 100, 115), new Vector3(0, -1, 0)))).toBe(buildings[99])
            expect(desc.intersect(new Ray(new Vector3(-10, 100, -10), new Vector3(0, -1, 0)))).toBeUndefined()
        })

        it("should produce same results as linear scan for many buildings", () => {
            // Arrange
            const desc = new CodeMapGeometricDescription(0)
            const buildings: CodeMapBuilding[] = []
            for (let i = 0; i < 100; i++) {
                const x = (i % 10) * 12
                const z = Math.floor(i / 10) * 12
                const b = makeBuilding(i, x, z, x + 10, z + 10, 5 + (i % 20))
                buildings.push(b)
                desc.add(b)
            }
            desc.setScales({ x: 1, y: 1, z: 1 })

            // Test multiple ray positions
            const testRays = [
                new Ray(new Vector3(5, 100, 5), new Vector3(0, -1, 0)),
                new Ray(new Vector3(55, 100, 55), new Vector3(0, -1, 0)),
                new Ray(new Vector3(115, 100, 115), new Vector3(0, -1, 0)),
                new Ray(new Vector3(-10, 100, -10), new Vector3(0, -1, 0)),
                new Ray(new Vector3(25, 100, 25), new Vector3(0, -1, 0))
            ]

            for (const ray of testRays) {
                // Act
                const bvhResult = desc.intersect(ray)
                const linearResult = linearIntersect(desc, ray)

                // Assert
                expect(bvhResult?.id).toBe(linearResult?.id)
            }
        })

        it("should work correctly with non-unit scales", () => {
            // Arrange
            const desc = new CodeMapGeometricDescription(50)
            for (let i = 0; i < 20; i++) {
                const x = (i % 5) * 15
                const z = Math.floor(i / 5) * 15
                desc.add(makeBuilding(i, x, z, x + 10, z + 10, 5 + i))
            }
            desc.setScales({ x: 2, y: 3, z: 1.5 })

            // Ray aimed at the scaled/translated scene center
            const ray = new Ray(new Vector3(-60, 200, -50), new Vector3(0, -1, 0))

            // Act
            const result = desc.intersect(ray)

            // Assert - should not throw and should return a valid building or undefined
            expect(result === undefined || desc.buildings.includes(result)).toBe(true)
        })

        it("should handle angled rays correctly", () => {
            // Arrange
            const desc = new CodeMapGeometricDescription(0)
            const building = makeBuilding(0, 0, 0, 10, 10, 20)
            desc.add(building)
            desc.setScales({ x: 1, y: 1, z: 1 })

            // Angled ray aimed at the building
            const direction = new Vector3(5 - 0, 10 - 100, 5 - 0).normalize()
            const ray = new Ray(new Vector3(0, 100, 0), direction)

            // Act
            const result = desc.intersect(ray)

            // Assert
            expect(result).toBe(building)
        })

        it("should return undefined when intersect is called before setScales", () => {
            // Arrange - BVH is null until setScales triggers rebuildScaledBoxes
            const desc = new CodeMapGeometricDescription(0)
            desc.add(makeBuilding(0, 0, 0, 10, 10))
            const ray = new Ray(new Vector3(5, 100, 5), new Vector3(0, -1, 0))

            // Act
            const result = desc.intersect(ray)

            // Assert
            expect(result).toBeUndefined()
        })

        it("should find buildings when all centroids are collinear (degenerate BVH midpoint fallback)", () => {
            // Arrange - all buildings share the same x and z centroid, differing only in z extent.
            // On the x-axis split every centroid falls on one side, triggering the
            // "left === start || left === end" fallback that splits the range in half instead.
            const desc = new CodeMapGeometricDescription(0)
            const buildings: CodeMapBuilding[] = []
            for (let i = 0; i < 10; i++) {
                // All buildings stacked at x=[0,10], varying only in z
                const b = makeBuilding(i, 0, i * 12, 10, i * 12 + 10, 5)
                buildings.push(b)
                desc.add(b)
            }
            desc.setScales({ x: 1, y: 1, z: 1 })

            // Ray aimed at the first building
            const ray = new Ray(new Vector3(5, 100, 5), new Vector3(0, -1, 0))

            // Act
            const result = desc.intersect(ray)

            // Assert - BVH must survive the degenerate split and still find the correct building
            expect(result).toBe(buildings[0])
        })
    })

    describe("getBuildingByPath", () => {
        it("should return a building by its path after adding", () => {
            // Arrange
            const desc = new CodeMapGeometricDescription(0)
            const building = makeBuilding(0, 0, 0, 10, 10)
            desc.add(building)

            // Act
            const result = desc.getBuildingByPath("/root/file0")

            // Assert
            expect(result).toBe(building)
        })

        it("should return undefined for an unknown path", () => {
            // Arrange
            const desc = new CodeMapGeometricDescription(0)
            desc.add(makeBuilding(0, 0, 0, 10, 10))

            // Act
            const result = desc.getBuildingByPath("/root/nonexistent")

            // Assert
            expect(result).toBeUndefined()
        })

        it("should keep buildingsByPath consistent after setScales rebuilds it", () => {
            // Arrange
            const desc = new CodeMapGeometricDescription(0)
            const buildingA = makeBuilding(0, 0, 0, 10, 10)
            const buildingB = makeBuilding(1, 20, 20, 30, 30)
            desc.add(buildingA)
            desc.add(buildingB)

            // Act - setScales triggers rebuildScaledBoxes which clears and rebuilds the map
            desc.setScales({ x: 2, y: 1, z: 2 })

            // Assert - both buildings must still be findable by path
            expect(desc.getBuildingByPath("/root/file0")).toBe(buildingA)
            expect(desc.getBuildingByPath("/root/file1")).toBe(buildingB)
        })

        it("should not return stale path entries after multiple setScales calls", () => {
            // Arrange
            const desc = new CodeMapGeometricDescription(0)
            const building = makeBuilding(0, 0, 0, 10, 10)
            desc.add(building)

            // Act - call setScales multiple times; map must remain correct each time
            desc.setScales({ x: 1, y: 1, z: 1 })
            desc.setScales({ x: 2, y: 2, z: 2 })
            desc.setScales({ x: 0.5, y: 0.5, z: 0.5 })

            // Assert
            expect(desc.getBuildingByPath("/root/file0")).toBe(building)
            expect(desc.getBuildingByPath("/root/nonexistent")).toBeUndefined()
        })
    })
})
