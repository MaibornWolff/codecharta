import { BufferAttribute, BufferGeometry, Float32BufferAttribute, Matrix4, Mesh } from "three"
import { Volume, exportedForTesting } from "./serialize3mf.service"

describe("serialize3mf service", () => {
    describe("constructVertices", () => {
        const { constructVertices } = exportedForTesting

        let vertices: string[]
        let vertexToNewVertexIndex: Map<string, number>
        let vertexIndexToNewVertexIndex: Map<number, number>
        let vertexIndexes: number[]
        let testMesh: Mesh
        let parentMatrix: Matrix4

        const testVertexPositions = [0, 0, 0, 2, 0, 0, 0, 2, 0]

        beforeEach(() => {
            vertices = []
            vertexToNewVertexIndex = new Map()
            vertexIndexToNewVertexIndex = new Map()
            vertexIndexes = [0, 1, 2]
            testMesh = new Mesh()
            testMesh.geometry.attributes["position"] = new BufferAttribute(new Float32Array(testVertexPositions), 3, false)
        })

        it("should create correct vertex entries", () => {
            constructVertices(vertices, vertexToNewVertexIndex, vertexIndexToNewVertexIndex, vertexIndexes, testMesh, parentMatrix)

            expect(vertices).toHaveLength(3)
            expect(vertexIndexToNewVertexIndex.size).toBe(3)
            expect(vertexToNewVertexIndex.size).toBe(3)
            expect([...vertexToNewVertexIndex.keys()].toString()).toBe(vertices.toString())
        })
    })

    describe("constructTriangles", () => {
        const { constructTriangles } = exportedForTesting

        let testGeometry: BufferGeometry
        let triangles: string[]
        let vertexIndexToNewVertexIndex: Map<number, number>
        let vertexIndexes: number[]
        let vertexPositionArray: Float32Array

        const expectedTriangleIndexes = [
            [0, 1, 2],
            [0, 1, 5],
            [1, 2, 5],
            [2, 0, 5]
        ]

        beforeEach(() => {
            testGeometry = new BufferGeometry()
            triangles = []
            vertexIndexToNewVertexIndex = new Map([
                [0, 0],
                [1, 1],
                [2, 2],
                [3, 0],
                [4, 1],
                [5, 5],
                [6, 1],
                [7, 2],
                [8, 5],
                [9, 2],
                [10, 0],
                [11, 5]
            ])
            vertexIndexes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
            vertexPositionArray = new Float32Array(Array.from({ length: vertexIndexes.length * 3 }).keys())
        })

        it("should add triangles without index correctly", () => {
            testGeometry.attributes["position"] = new BufferAttribute(vertexPositionArray, 3, false)

            constructTriangles(testGeometry, triangles, vertexIndexToNewVertexIndex, vertexIndexes)

            expect(triangles).toHaveLength(4)

            let testStep = 0
            for (const expectedSubset of expectedTriangleIndexes) {
                for (const vertexNumber of [`"${expectedSubset[0]}"`, `"${expectedSubset[1]}"`, `"${expectedSubset[2]}"`]) {
                    expect(triangles[testStep]).toContain(vertexNumber)
                }
                testStep++
            }
        })

        it("should add triangles with index correctly", () => {
            testGeometry.index = new BufferAttribute(new Uint32Array(vertexIndexes), 1)

            constructTriangles(testGeometry, triangles, vertexIndexToNewVertexIndex, vertexIndexes)

            expect(triangles).toHaveLength(4)

            let testStep = 0
            for (const expectedSubset of expectedTriangleIndexes) {
                for (const vertexNumber of [`"${expectedSubset[0]}"`, `"${expectedSubset[1]}"`, `"${expectedSubset[2]}"`]) {
                    expect(triangles[testStep]).toContain(vertexNumber)
                }
                testStep++
            }
        })

        it("should not add any triangles to list if there are not present in lookup", () => {
            testGeometry.index = new BufferAttribute(new Uint32Array(vertexIndexes), 1)
            const reducedIndex = [1, 2, 3, 5, 6, 7]
            constructTriangles(testGeometry, triangles, vertexIndexToNewVertexIndex, reducedIndex)

            expect(triangles).toHaveLength(0)
        })
    })

    describe("constructVolume", () => {
        const { constructVolume } = exportedForTesting

        let volumes: Volume[]
        let colorToExtruder: Map<string, number>
        let childMesh: Mesh
        const volumeCount = 1

        beforeEach(() => {
            volumes = []
            colorToExtruder = new Map<string, number>()
            childMesh = new Mesh()
            childMesh.name = "TestMesh"
        })

        it("should add new colors to the extruder map if not present", () => {
            const color1 = "FFBEAF"
            const color2 = "FFDEAD"
            constructVolume(childMesh, color1, 0, 42, volumes, volumeCount, colorToExtruder)
            constructVolume(childMesh, color2, 43, 45, volumes, volumeCount, colorToExtruder)

            expect(volumes).toHaveLength(2)
            expect(colorToExtruder.size).toBe(2)
            expect(colorToExtruder.get(color1)).toBe(1)
            expect(colorToExtruder.get(color2)).toBe(2)
            expect(volumes[0].extruder).toBe(1)
            expect(volumes[1].extruder).toBe(2)
        })

        it("should not add color to the extruder if already present", () => {
            const color1 = "FFBEAF"
            constructVolume(childMesh, color1, 0, 42, volumes, volumeCount, colorToExtruder)
            constructVolume(childMesh, color1, 43, 45, volumes, volumeCount, colorToExtruder)

            expect(volumes).toHaveLength(2)
            expect(colorToExtruder.size).toBe(1)
            expect(colorToExtruder.get(color1)).toBe(1)
            expect(volumes[0].extruder).toBe(1)
            expect(volumes[1].extruder).toBe(1)
        })

        it("should set volumeName according to the schema", () => {
            childMesh.name = "Map"
            const otherMesh = new Mesh()
            const otherMeshName = "otherName"
            otherMesh.name = otherMeshName

            constructVolume(childMesh, "C0FFEE", 0, 42, volumes, volumeCount, colorToExtruder)
            constructVolume(otherMesh, "C0FFEE", 43, 45, volumes, volumeCount, colorToExtruder)

            expect(volumes).toHaveLength(2)
            expect(volumes[0].name).toBe("Map 0xC0FFEE")
            expect(volumes[1].name).toBe(otherMeshName)
        })

        it("should set all properties as expected", () => {
            const otherMesh = new Mesh()
            otherMesh.name = "Map"

            constructVolume(childMesh, "C0FFEE", 0, 42, volumes, volumeCount, colorToExtruder)
            constructVolume(otherMesh, "C0FFEE", 43, 45, volumes, volumeCount, colorToExtruder)

            expect(volumes).toHaveLength(2)
            expect(volumes[1].id).toBe(volumeCount)
            expect(volumes[1].name).toBe("Map 0xC0FFEE")
            expect(volumes[1].color).toBe("C0FFEE")
            expect(volumes[1].extruder).toBe(1)
            expect(volumes[1].firstTriangleId).toBe(43)
            expect(volumes[1].lastTriangleId).toBe(45)
        })
    })

    describe("convertColorArrayToHexString", () => {
        const { convertColorArrayToHexString } = exportedForTesting
        const inputNumbers = [0, 0, 1, 0, 1, 0, 1, 0, 0, 0.3, 0.3, 0.3, 0.5, 0.5, 0, 0, 0.5, 0.5]
        const floatBufferNumbers = new Float32Array(inputNumbers)
        const floatBuffer = new Float32BufferAttribute(floatBufferNumbers, 3, false)

        const indicies = [0, 1, 2, 3, 4, 5]
        const outputColours = ["0000ff", "00ff00", "ff0000", "4d4d4d", "808000", "008080"]

        it.each(indicies)("should convert number arrays to colors", index => {
            expect(convertColorArrayToHexString(inputNumbers, index * 3)).toBe(outputColours[index])
        })

        it.each(indicies)("should convert Float32BufferAttribute to colors", index => {
            expect(convertColorArrayToHexString(floatBuffer, index)).toBe(outputColours[index])
        })
    })
})
