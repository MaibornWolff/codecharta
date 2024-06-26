import {
    BufferAttribute,
    BufferGeometry,
    Float32BufferAttribute,
    Matrix4,
    Mesh,
    MeshBasicMaterial,
    ObjectLoader,
    ShaderMaterial,
    Uint16BufferAttribute
} from "three"
import { Volume, exportedForTesting, serialize3mf } from "./serialize3mf.service"
import { readFileSync } from "fs"
import { strFromU8, unzipSync } from "fflate"
import { resolve } from "node:path"
import { XMLParser, XMLValidator } from "fast-xml-parser"

describe("serialize3mf service", () => {
    describe("serialize3mf", () => {
        const minimalExamplePath = resolve(__dirname, "../../resources/minimalScene.json")

        it("should produce a valid set of xml files", async () => {
            const threeObjectLoader = new ObjectLoader()
            const xmlParser = new XMLParser({ removeNSPrefix: false, ignoreAttributes: false, parseAttributeValue: true })

            const jsonScene = JSON.parse(readFileSync(minimalExamplePath, { encoding: "utf8" }))
            const mesh = threeObjectLoader.parse(jsonScene).getObjectByName("PrintMesh") as Mesh

            const output = await serialize3mf(mesh)
            const unzipOutput = unzipSync(new Uint8Array(output as unknown as ArrayBufferLike))
            const xmlData3D = xmlParser.parse(strFromU8(unzipOutput["3D/3dmodel.model"]))
            const xmlDataMeta = xmlParser.parse(strFromU8(unzipOutput["Metadata/Slic3r_PE_model.config"]))
            const stringDataRels = strFromU8(unzipOutput["_rels/.rels"])
            const stringDataContentTypes = strFromU8(unzipOutput["[Content_Types].xml"])

            // Debug export, write parsed test data to file, to slice it
            // writeFileSync(resolve(__dirname, "../../resources/minimalSceneOutputBufferAttribute.zip"), new Uint8Array(output as unknown as ArrayBufferLike))

            expect(XMLValidator.validate(stringDataRels)).toBe(true)
            expect(XMLValidator.validate(stringDataContentTypes)).toBe(true)

            let volumeIDcheck = 0
            for (const currentVolume of xmlDataMeta["config"]["object"]["volume"]) {
                expect(currentVolume["@_firstid"] <= currentVolume["@_lastid"]).toBeTruthy()
                expect(currentVolume["@_firstid"]).toBe(volumeIDcheck)
                volumeIDcheck = currentVolume["@_lastid"] + 1
            }

            let maxTriangleID = 0
            for (const triangle of xmlData3D["model"]["resources"]["object"]["mesh"]["triangles"]["triangle"]) {
                maxTriangleID = Math.max(triangle["@_v1"], triangle["@_v2"], triangle["@_v3"], maxTriangleID)
            }
            expect(xmlData3D["model"]["resources"]["object"]["mesh"]["vertices"]["vertex"]).toHaveLength(maxTriangleID + 1)
        })
    })

    describe("extractMesh...", () => {
        let vertices: string[]
        let triangles: string[]
        let volumes: Volume[]

        let testMesh: Mesh
        const side1 = [0, 0, 0, 2, 0, 0, 2, 2, 0, 0, 0, 0, 0, 2, 0, 2, 2, 0]
        const side2 = [0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 2, 0, 2]
        const side3 = [2, 0, 0, 2, 2, 0, 2, 0, 2, 2, 2, 0, 2, 2, 2, 2, 0, 2]
        const side4 = [2, 2, 0, 2, 2, 2, 0, 2, 0, 0, 2, 2, 2, 2, 2, 0, 2, 0]
        const side5 = [0, 2, 2, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2]
        const side6 = [0, 0, 2, 2, 0, 2, 0, 2, 2, 2, 0, 2, 2, 2, 2, 0, 2, 2]
        const testPositionArray = [side1, side2, side3, side4, side5, side6].flat(2)
        let anotherTestMesh: Mesh
        const anotherTestMeshPositionArray = [0, 0, 2, 2, 0, 2, 0, 2, 2, 0, 0, 4]
        const anotherTestMeshGeometryIndexArray = [0, 1, 2, 0, 1, 3, 1, 2, 3, 2, 0, 3]

        const testPositionArrayReduced = [
            [0, 0, 0],
            [2, 0, 0],
            [2, 2, 0],
            [0, 2, 0],
            [0, 0, 2],
            [2, 0, 2],
            [2, 2, 2],
            [0, 2, 2]
        ]

        beforeEach(() => {
            vertices = []
            triangles = []
            volumes = []

            testMesh = new Mesh()
            testMesh.geometry.setAttribute("position", new Float32BufferAttribute(testPositionArray, 3))
            testMesh.material = new ShaderMaterial()

            anotherTestMesh = new Mesh()
            anotherTestMesh.geometry.setAttribute("position", new Float32BufferAttribute(anotherTestMeshPositionArray, 3))
            anotherTestMesh.geometry.setIndex(new Uint16BufferAttribute(anotherTestMeshGeometryIndexArray, 1))
            anotherTestMesh.material = new MeshBasicMaterial({ color: 0xc0_ff_ee })
        })

        describe("extractMeshData", () => {
            const { extractMeshData } = exportedForTesting

            it("should return correct triplet", () => {
                const rootMesh = new Mesh()
                rootMesh.children = [testMesh, anotherTestMesh]

                const { vertices, triangles, volumes } = extractMeshData(rootMesh)

                expect(vertices).toHaveLength(9)
                expect(volumes).toHaveLength(2)
                expect(volumes[0].lastTriangleId).toBe(11)
                expect(volumes[1].firstTriangleId).toBe(12)
                expect(volumes[1].lastTriangleId).toBe(15)
                expect(triangles).toHaveLength(16)

                for (const xyzPos of [...testPositionArrayReduced, [0, 0, 4]]) {
                    expect(vertices).toContain(`<vertex x="${xyzPos[0]}" y="${xyzPos[1]}" z="${xyzPos[2]}"/>`)
                }
            })
        })

        describe("extractChildMeshData", () => {
            const { extractChildMeshData } = exportedForTesting

            let vertexToNewVertexIndex: Map<string, number>
            let colorToExtruder: Map<string, number>

            let volumeCount: number

            let parentMatrix: Matrix4

            const testPositionArrayChildAndMatrix = [
                [1, 1, 1],
                [1, 1, 9],
                [5, 5, 5]
            ]

            beforeEach(() => {
                vertexToNewVertexIndex = new Map()
                colorToExtruder = new Map()

                volumeCount = 1

                parentMatrix = new Matrix4()
            })

            it("should not return if mesh not visible", () => {
                testMesh.visible = false
                extractChildMeshData(
                    testMesh,
                    vertices,
                    triangles,
                    vertexToNewVertexIndex,
                    volumeCount,
                    colorToExtruder,
                    volumes,
                    parentMatrix
                )

                expect(vertices).toHaveLength(0)
                expect(triangles).toHaveLength(0)
                expect(vertexToNewVertexIndex.size).toBe(0)
                expect(colorToExtruder.size).toBe(0)
                expect(volumes).toHaveLength(0)
            })

            it("should add entries to data collection", () => {
                extractChildMeshData(
                    testMesh,
                    vertices,
                    triangles,
                    vertexToNewVertexIndex,
                    volumeCount,
                    colorToExtruder,
                    volumes,
                    parentMatrix
                )

                expect(vertices).toHaveLength(8)
                expect(triangles).toHaveLength(12)
                expect(vertexToNewVertexIndex.size).toBe(8)
                expect(volumeCount).toBe(1)
                expect(colorToExtruder.size).toBe(1)
                expect(volumes).toHaveLength(1)
                expect(volumes[0].lastTriangleId).toBe(11)
                for (const xyzPos of testPositionArrayReduced) {
                    expect(vertices).toContain(`<vertex x="${xyzPos[0]}" y="${xyzPos[1]}" z="${xyzPos[2]}"/>`)
                }
            })

            it("should add children to data collection", () => {
                testMesh.children = [anotherTestMesh]
                testMesh.matrix.makeScale(2, 2, 2)
                parentMatrix = parentMatrix.makeTranslation(1, 1, 1)

                extractChildMeshData(
                    testMesh,
                    vertices,
                    triangles,
                    vertexToNewVertexIndex,
                    volumeCount,
                    colorToExtruder,
                    volumes,
                    parentMatrix
                )

                expect(vertices).toHaveLength(9)
                expect(triangles).toHaveLength(16)
                expect(vertexToNewVertexIndex.size).toBe(9)
                expect(volumeCount).toBe(1) // TODO: verify this number
                expect(colorToExtruder.size).toBe(2)
                expect(colorToExtruder.keys()).toContain("c0ffee")
                expect(colorToExtruder.keys()).toContain("ffffff")
                expect(volumes).toHaveLength(2)
                expect(volumes[0].lastTriangleId).toBe(3)
                expect(volumes[1].lastTriangleId).toBe(15)
                expect(volumes[1].firstTriangleId).toBe(4)
                for (const xyzPos of testPositionArrayChildAndMatrix) {
                    expect(vertices).toContain(`<vertex x="${xyzPos[0]}" y="${xyzPos[1]}" z="${xyzPos[2]}"/>`)
                }
            })
        })
    })

    describe("groupMeshVerticesByColor", () => {
        const { groupMeshVerticesByColor } = exportedForTesting
        let testMesh: Mesh
        const testColorArray = [1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1]
        const testPositionArray = [0, 0, 0, 0, 0, 2]

        beforeEach(() => {
            testMesh = new Mesh()
        })

        it("should create correct map if attributes color is present", () => {
            testMesh.geometry.setAttribute("color", new Float32BufferAttribute(testColorArray, 3))

            const colorToIndices = groupMeshVerticesByColor(testMesh)

            const expectedResult = ["ff0000", "00ff00", "0000ff"]
            let expectedResultCounter = 0

            for (const colorString of expectedResult) {
                expect(colorToIndices.get(colorString)).toHaveLength(2)
                expect(colorToIndices.get(colorString)).toEqual([expectedResultCounter, expectedResultCounter + 3])
                expectedResultCounter++
            }
        })

        it("should create correct map if only material present", () => {
            testMesh.geometry.setAttribute("position", new Float32BufferAttribute(testPositionArray, 3))
            testMesh.material = new MeshBasicMaterial({ color: 0xff_00_00 })

            const colorToIndicies = groupMeshVerticesByColor(testMesh)

            expect(colorToIndicies.get("ff0000")).toHaveLength(2)
            expect(colorToIndicies.get("ff0000")).toEqual([0, 1])
        })

        it("should create correct map if only material present", () => {
            testMesh.geometry.setAttribute("position", new Float32BufferAttribute(testPositionArray, 3))
            testMesh.material = new MeshBasicMaterial({ color: 0xff_00_00 })

            const colorToIndicies = groupMeshVerticesByColor(testMesh)

            expect(colorToIndicies.get("ff0000")).toHaveLength(2)
            expect(colorToIndicies.get("ff0000")).toEqual([0, 1])
        })

        it("should create correct map if only material present", () => {
            testMesh.geometry.setAttribute("position", new Float32BufferAttribute(testPositionArray, 3))
            testMesh.material = new ShaderMaterial()

            const colorToIndicies = groupMeshVerticesByColor(testMesh)

            expect(colorToIndicies.get("ffffff")).toHaveLength(2)
            expect(colorToIndicies.get("ffffff")).toEqual([0, 1])
        })
    })

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
            testMesh.geometry.attributes["position"] = new Float32BufferAttribute(testVertexPositions, 3)
            testMesh.matrix.makeScale(2, 2, 2)
            parentMatrix = new Matrix4()
        })

        it("should create correct vertex entries", () => {
            constructVertices(vertices, vertexToNewVertexIndex, vertexIndexToNewVertexIndex, vertexIndexes, testMesh, parentMatrix)

            expect(vertices).toHaveLength(3)
            expect(vertexIndexToNewVertexIndex.size).toBe(3)
            expect(vertexToNewVertexIndex.size).toBe(3)
            expect([...vertexToNewVertexIndex.keys()].toString()).toBe(vertices.toString())
            const expectedPositions = [
                [0, 0, 0],
                [4, 0, 0],
                [0, 4, 0]
            ]
            for (const xyzPos of expectedPositions) {
                expect(vertices).toContain(`<vertex x="${xyzPos[0]}" y="${xyzPos[1]}" z="${xyzPos[2]}"/>`)
            }
        })

        it("should apply parent matrix if present", () => {
            parentMatrix = new Matrix4()
            parentMatrix.setPosition(1, 1, 1)

            constructVertices(vertices, vertexToNewVertexIndex, vertexIndexToNewVertexIndex, vertexIndexes, testMesh, parentMatrix)

            expect(vertices).toHaveLength(3)
            expect(vertexIndexToNewVertexIndex.size).toBe(3)
            expect(vertexToNewVertexIndex.size).toBe(3)
            expect([...vertexToNewVertexIndex.keys()].toString()).toBe(vertices.toString())
            const expectedPositions = [
                [1, 1, 1],
                [5, 1, 1],
                [1, 5, 1]
            ]
            for (const xyzPos of expectedPositions) {
                expect(vertices).toContain(`<vertex x="${xyzPos[0]}" y="${xyzPos[1]}" z="${xyzPos[2]}"/>`)
            }
        })

        it("should not add new entries to indexLookup but vertexLookup if repeated information", () => {
            const testDoubleVertexPositions = [...testVertexPositions, ...testVertexPositions]
            const doubleMesh = new Mesh()
            doubleMesh.geometry.attributes["position"] = new Float32BufferAttribute(testDoubleVertexPositions, 3)
            const longerIndex = [1, 2, 3, 4, 5, 6]

            constructVertices(vertices, vertexToNewVertexIndex, vertexIndexToNewVertexIndex, longerIndex, doubleMesh, parentMatrix)

            expect(vertices).toHaveLength(3)
            expect(vertexIndexToNewVertexIndex.size).toBe(6)
            expect(vertexToNewVertexIndex.size).toBe(3)
            expect([...vertexToNewVertexIndex.keys()].toString()).toBe(vertices.toString())
            const expectedPositions = [
                [0, 0, 0],
                [2, 0, 0],
                [0, 2, 0]
            ]
            for (const xyzPos of expectedPositions) {
                expect(vertices).toContain(`<vertex x="${xyzPos[0]}" y="${xyzPos[1]}" z="${xyzPos[2]}"/>`)
            }
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
