import { Node } from "../../../codeCharta.model"
import { clone } from "../../../util/clone"
import { STATE, TEST_NODE_ROOT } from "../../../util/dataMocks"
import { BuildResult, GeometryGenerator } from "./geometryGenerator"
import { InstancedBufferAttribute, InstancedMesh, Matrix4 } from "three"

describe("geometryGenerator", () => {
    let geomGen: GeometryGenerator
    let testNodes: Node[]
    const state = clone(STATE)
    state.dynamicSettings.heightMetric = "a" // set to a, since it is the delta defined in TEST_NODE_ROOT

    beforeEach(() => {
        initData()
    })

    const setTestNodes = () => {
        // heightDelta must be negative here to exercise the expansion path in fillInstance:
        // when renderDelta < 0 and the node is not flat, the geometry adds Math.abs(renderDelta)
        // to measures.height so that the "shrink" delta is shown as a visible stripe on the
        // building.  A positive delta does not expand the box in this way.
        const updatedNode = { heightDelta: -50 }
        return [TEST_NODE_ROOT].map(node => {
            return { ...node, ...updatedNode }
        })
    }

    const initData = () => {
        geomGen = new GeometryGenerator()
        testNodes = setTestNodes()
    }

    describe("addBuilding", () => {
        let buildResult: BuildResult
        const setFlattened = (isFlat: boolean) => {
            for (const node of testNodes) {
                node.flat = isFlat
            }
        }

        it("should add delta to height when not flattened", () => {
            setFlattened(false)
            buildResult = geomGen.build(testNodes, null, state, true)

            expect(testNodes[0].flat).toBeFalsy()
            // TEST_NODE_ROOT: z0=6 (mapped to measures.y), height=2, heightDelta=-50.
            // ensureMinHeightUnlessDeltaIsNegative: delta<=0 → height stays 2.
            // fillInstance negative-delta expansion: 2 + Math.abs(-50) = 52.
            // boundingBox.max.y = measures.y + measures.height = 6 + 52 = 58.
            expect(buildResult.desc.buildings[0].boundingBox.max.y).toBe(58)
        })

        it("should not add delta to height when flattened", () => {
            setFlattened(true)
            buildResult = geomGen.build(testNodes, null, state, true)

            expect(testNodes[0].flat).toBeTruthy()
            // When flat=true the negative-delta expansion is skipped.
            // measures.y=6 (from z0), measures.height=2 (from height, delta path not taken).
            // boundingBox.max.y = 6 + 2 = 8.
            expect(buildResult.desc.buildings[0].boundingBox.max.y).toBe(8)
        })
    })

    describe("InstancedMesh output", () => {
        it("should return an InstancedMesh with correct instance count", () => {
            // Arrange & Act
            const buildResult = geomGen.build(testNodes, null, state, false)

            // Assert
            expect(buildResult.mesh).toBeInstanceOf(InstancedMesh)
            expect(buildResult.mesh.count).toBe(testNodes.length)
        })

        it("should have template index buffer with indicesPerNode (30) indices", () => {
            // Arrange
            const buildResult = geomGen.build(testNodes, null, state, false)

            // Act
            const indexAttribute = buildResult.mesh.geometry.index

            // Assert — 5 visible faces × 6 indices per face (2 triangles × 3 vertices) = 30
            expect(indexAttribute.count).toBe(30)
        })

        it("should have per-instance color attribute", () => {
            // Arrange
            const buildResult = geomGen.build(testNodes, null, state, false)

            // Act
            const colorAttr = buildResult.mesh.geometry.getAttribute("color")

            // Assert
            expect(colorAttr).toBeInstanceOf(InstancedBufferAttribute)
            expect(colorAttr.count).toBe(testNodes.length)
        })

        it("should set instance matrix with correct translation and scale", () => {
            // Arrange
            const buildResult = geomGen.build(testNodes, null, state, false)
            const matrix = new Matrix4()

            // Act
            buildResult.mesh.getMatrixAt(0, matrix)
            const elements = matrix.elements

            // Assert — matrix encodes scale on diagonal and position in last column
            // For TEST_NODE_ROOT: x0=5, z0=6, y0=7, width=1, height depends on delta, length=3
            expect(elements[12]).toBe(testNodes[0].x0) // translation X
            expect(elements[13]).toBe(testNodes[0].z0) // translation Y
            expect(elements[14]).toBe(testNodes[0].y0) // translation Z
        })

        it("should set isLeaf=1 for leaf nodes and isLeaf=0 for non-leaf", () => {
            // Arrange
            const floorNode = { ...TEST_NODE_ROOT, isLeaf: false }
            const leafNode = { ...TEST_NODE_ROOT, isLeaf: true, id: 1 }
            const nodes = [floorNode, leafNode]

            // Act
            const buildResult = geomGen.build(nodes, null, state, false)
            const isLeafAttr = buildResult.mesh.geometry.getAttribute("isLeaf") as InstancedBufferAttribute

            // Assert
            expect(isLeafAttr.getX(0)).toBe(0)
            expect(isLeafAttr.getX(1)).toBe(1)
        })
    })
})
