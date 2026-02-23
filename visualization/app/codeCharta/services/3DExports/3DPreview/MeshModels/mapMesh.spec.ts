import { BufferAttribute, BufferGeometry, Float32BufferAttribute, Mesh, MeshBasicMaterial, Box3, Vector3, ShaderMaterial } from "three"
import { GeometryOptions } from "../preview3DPrintMesh"
import { BackPrintColorChangeStrategy } from "../ColorChangeStrategies/backPrintColorChangeStrategy"
import { MapMesh } from "./mapMesh"
import { indicesPerNode } from "../../../../ui/codeMap/rendering/geometryGenerationHelper"

describe("MapMesh", () => {
    let mapMesh: MapMesh
    let geometryOptions: GeometryOptions
    let originalMapMesh: Mesh

    beforeEach(() => {
        originalMapMesh = new Mesh(new BufferGeometry(), new MeshBasicMaterial())
        originalMapMesh.geometry.setAttribute("color", new Float32BufferAttribute([0.8, 0.8, 0.8, 0.9, 0.2, 0.2], 3))
        originalMapMesh.geometry.setAttribute("position", new Float32BufferAttribute([0, 0, 0, 1, 1, 1, 2, 2, 2], 3))

        originalMapMesh.geometry.computeBoundingBox = jest.fn(() => {
            originalMapMesh.geometry.boundingBox = new Box3(new Vector3(0, 0, 0), new Vector3(2, 3, 4))
        })

        originalMapMesh.geometry.computeBoundingBox()

        geometryOptions = {
            originalMapMesh,
            width: 200,
            areaMetricTitle: "Area",
            areaMetricData: {} as any,
            heightMetricTitle: "Height",
            heightMetricData: {} as any,
            colorMetricTitle: "Color",
            colorMetricData: {} as any,
            colorRange: {} as any,
            frontText: "Front Text",
            secondRowText: "Second Row",
            qrCodeText: "QR Code",
            defaultMaterial: new ShaderMaterial(),
            numberOfColors: 5,
            layerHeight: 0.1,
            frontTextSize: 12,
            secondRowTextSize: 12,
            secondRowVisible: true,
            printHeight: 100,
            mapSideOffset: 10,
            baseplateHeight: 10,
            logoSize: 50
        }

        mapMesh = new MapMesh()
    })

    it("should initialize and set geometry and material", async () => {
        await mapMesh.init(geometryOptions)

        expect(mapMesh.material).toBe(originalMapMesh.material)
        expect(mapMesh.geometry).toBeInstanceOf(BufferGeometry)
        expect(mapMesh.colorChangeStrategy).toBeInstanceOf(BackPrintColorChangeStrategy)
    })

    it("should update map geometry correctly", async () => {
        await mapMesh.init(geometryOptions)
        const newGeometry = mapMesh.geometry

        expect(newGeometry.boundingBox).toBeDefined()
        expect(newGeometry.attributes.position).toBeDefined()

        const expectedBoundingBox = new Box3(new Vector3(-90, -90, 0), new Vector3(90, 90, 180))
        expect(newGeometry.boundingBox).toEqual(expectedBoundingBox)
    })

    it("should update map colors correctly", async () => {
        await mapMesh.init(geometryOptions)

        mapMesh.updateColor(3)
        const newColors = mapMesh.geometry.getAttribute("color") as BufferAttribute

        expect(newColors.array).toEqual(new Float32BufferAttribute([0.5, 0.5, 0.5, 1, 1, 1], 3).array)
    })

    it("should add bottom face indices for 3D print export", async () => {
        // Arrange
        const verticesPerBox = 24
        const numBoxes = 2
        const positions = new Float32Array(numBoxes * verticesPerBox * 3)
        const colors = new Float32Array(numBoxes * verticesPerBox * 3).fill(0.5)
        const indices = new Uint32Array(numBoxes * indicesPerNode)
        for (let box = 0; box < numBoxes; box++) {
            const base = box * verticesPerBox
            for (let index = 0; index < indicesPerNode; index++) {
                indices[box * indicesPerNode + index] = base + (index % verticesPerBox)
            }
        }

        originalMapMesh.geometry.setAttribute("position", new Float32BufferAttribute(positions, 3))
        originalMapMesh.geometry.setAttribute("color", new Float32BufferAttribute(colors, 3))
        originalMapMesh.geometry.setIndex(new BufferAttribute(indices, 1))

        // Act
        await mapMesh.init(geometryOptions)

        // Assert
        const resultIndex = mapMesh.geometry.index
        const expectedCount = numBoxes * indicesPerNode + numBoxes * 6
        expect(resultIndex.count).toBe(expectedCount)

        for (let box = 0; box < numBoxes; box++) {
            const bottomBase = box * verticesPerBox + 8
            const offset = numBoxes * indicesPerNode + box * 6
            expect(resultIndex.getX(offset)).toBe(bottomBase)
            expect(resultIndex.getX(offset + 1)).toBe(bottomBase + 2)
            expect(resultIndex.getX(offset + 2)).toBe(bottomBase + 1)
            expect(resultIndex.getX(offset + 3)).toBe(bottomBase)
            expect(resultIndex.getX(offset + 4)).toBe(bottomBase + 3)
            expect(resultIndex.getX(offset + 5)).toBe(bottomBase + 2)
        }
    })

    it("should add bottom face indices for a single box", async () => {
        // Arrange
        const verticesPerBox = 24
        const numBoxes = 1
        const positions = new Float32Array(numBoxes * verticesPerBox * 3)
        const colors = new Float32Array(numBoxes * verticesPerBox * 3).fill(0.5)
        const indices = new Uint32Array(numBoxes * indicesPerNode)
        for (let index = 0; index < indicesPerNode; index++) {
            indices[index] = index % verticesPerBox
        }

        originalMapMesh.geometry.setAttribute("position", new Float32BufferAttribute(positions, 3))
        originalMapMesh.geometry.setAttribute("color", new Float32BufferAttribute(colors, 3))
        originalMapMesh.geometry.setIndex(new BufferAttribute(indices, 1))

        // Act
        await mapMesh.init(geometryOptions)

        // Assert
        const resultIndex = mapMesh.geometry.index
        const originalFaceCount = 6
        const totalTrianglesPerBox = indicesPerNode / 3 + 2 // 5 visible faces (10 triangles) + 1 bottom face (2 triangles)
        expect(resultIndex.count).toBe(indicesPerNode + originalFaceCount)
        expect(resultIndex.count / 3).toBe(totalTrianglesPerBox)
    })

    it("should restore total triangle count to match original 6-face geometry", async () => {
        // Arrange
        const verticesPerBox = 24
        const numBoxes = 3
        const positions = new Float32Array(numBoxes * verticesPerBox * 3)
        const colors = new Float32Array(numBoxes * verticesPerBox * 3).fill(0.5)
        const indices = new Uint32Array(numBoxes * indicesPerNode)
        for (let box = 0; box < numBoxes; box++) {
            const base = box * verticesPerBox
            for (let index = 0; index < indicesPerNode; index++) {
                indices[box * indicesPerNode + index] = base + (index % verticesPerBox)
            }
        }

        originalMapMesh.geometry.setAttribute("position", new Float32BufferAttribute(positions, 3))
        originalMapMesh.geometry.setAttribute("color", new Float32BufferAttribute(colors, 3))
        originalMapMesh.geometry.setIndex(new BufferAttribute(indices, 1))

        // Act
        await mapMesh.init(geometryOptions)

        // Assert — original geometry had 6 faces × 2 triangles × 3 indices = 36 indices per box
        const originalIndicesPerBox = 36
        const resultIndex = mapMesh.geometry.index
        expect(resultIndex.count).toBe(numBoxes * originalIndicesPerBox)
    })

    it("should not crash when geometry has no index", async () => {
        // Arrange — geometry with position and color but NO index
        const positions = new Float32Array([0, 0, 0, 1, 1, 1, 2, 2, 2])
        const colors = new Float32Array([0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5])
        originalMapMesh.geometry.setAttribute("position", new Float32BufferAttribute(positions, 3))
        originalMapMesh.geometry.setAttribute("color", new Float32BufferAttribute(colors, 3))
        // No setIndex call — geometry.index will be null

        // Act & Assert — should not throw
        await mapMesh.init(geometryOptions)
        expect(mapMesh.geometry.index).toBeNull()
    })

    it("should use correct bottom face winding order matching the original geometry generator", async () => {
        // Arrange — single box with real vertex positions so we can verify winding
        const verticesPerBox = 24
        // Create a unit box at origin: min=(0,0,0) max=(1,1,1)
        // Vertex layout per box: left(4), right(4), bottom(4), top(4), back(4), front(4)
        const positions = new Float32Array(verticesPerBox * 3)
        // Bottom face vertices (indices 8-11 within the box)
        // From setPositions in geometryGenerationHelper:
        // bottomLeft(8):  minX, minY, minZ
        // topLeft(9):     minX, minY, maxZ
        // topRight(10):   maxX, minY, maxZ
        // bottomRight(11): maxX, minY, minZ
        const bottomVertexStart = 8 * 3
        // vertex 8: (0, 0, 0)
        positions[bottomVertexStart] = 0
        positions[bottomVertexStart + 1] = 0
        positions[bottomVertexStart + 2] = 0
        // vertex 9: (0, 0, 1)
        positions[bottomVertexStart + 3] = 0
        positions[bottomVertexStart + 4] = 0
        positions[bottomVertexStart + 5] = 1
        // vertex 10: (1, 0, 1)
        positions[bottomVertexStart + 6] = 1
        positions[bottomVertexStart + 7] = 0
        positions[bottomVertexStart + 8] = 1
        // vertex 11: (1, 0, 0)
        positions[bottomVertexStart + 9] = 1
        positions[bottomVertexStart + 10] = 0
        positions[bottomVertexStart + 11] = 0

        const colors = new Float32Array(verticesPerBox * 3).fill(0.5)
        const indices = new Uint32Array(indicesPerNode)
        for (let index = 0; index < indicesPerNode; index++) {
            indices[index] = index % verticesPerBox
        }

        originalMapMesh.geometry.setAttribute("position", new Float32BufferAttribute(positions, 3))
        originalMapMesh.geometry.setAttribute("color", new Float32BufferAttribute(colors, 3))
        originalMapMesh.geometry.setIndex(new BufferAttribute(indices, 1))

        // Act
        await mapMesh.init(geometryOptions)

        // Assert — verify the bottom face triangles reference the bottom vertices (8-11)
        const resultIndex = mapMesh.geometry.index
        const bottomFaceStart = indicesPerNode
        // Triangle 1: vertices 8, 10, 9 (negative Y winding)
        expect(resultIndex.getX(bottomFaceStart)).toBe(8)
        expect(resultIndex.getX(bottomFaceStart + 1)).toBe(10)
        expect(resultIndex.getX(bottomFaceStart + 2)).toBe(9)
        // Triangle 2: vertices 8, 11, 10
        expect(resultIndex.getX(bottomFaceStart + 3)).toBe(8)
        expect(resultIndex.getX(bottomFaceStart + 4)).toBe(11)
        expect(resultIndex.getX(bottomFaceStart + 5)).toBe(10)
    })

    it("should change size and update geometry scale", async () => {
        await mapMesh.init(geometryOptions)

        const oldWidth = geometryOptions.width
        geometryOptions.width = 400

        const scaleMock = jest.spyOn(mapMesh.geometry, "scale")

        await mapMesh.changeSize(geometryOptions, oldWidth)
        const scale = (geometryOptions.width - 2 * geometryOptions.mapSideOffset) / (oldWidth - 2 * geometryOptions.mapSideOffset)

        expect(scaleMock).toHaveBeenCalledWith(scale, scale, scale)
    })
})
