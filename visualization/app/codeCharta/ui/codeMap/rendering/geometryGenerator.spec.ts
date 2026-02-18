import { Node } from "../../../codeCharta.model"
import { clone } from "../../../util/clone"
import { STATE, TEST_NODE_ROOT } from "../../../util/dataMocks"
import { BuildResult, GeometryGenerator } from "./geometryGenerator"
import { indicesPerNode } from "./geometryGenerationHelper"
import { BufferAttribute } from "three"

describe("geometryGenerator", () => {
    let geomGen: GeometryGenerator
    let testNodes: Node[]
    const state = clone(STATE)
    state.dynamicSettings.heightMetric = "a" // set to a, since it is the delta defined in TEST_NODE_ROOT

    beforeEach(() => {
        initData()
    })

    const setTestNodes = () => {
        const updatedNode = { heightDelta: -50 } // delta has to be negative why is that ?
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
            expect(buildResult.desc.buildings[0].boundingBox.max.y).toBe(58)
        })

        it("should not add delta to height when flattened", () => {
            setFlattened(true)
            buildResult = geomGen.build(testNodes, null, state, true)

            expect(testNodes[0].flat).toBeTruthy()
            expect(buildResult.desc.buildings[0].boundingBox.max.y).toBe(8)
        })
    })

    describe("index buffer", () => {
        it("should generate exactly indicesPerNode (30) indices per node, skipping bottom faces", () => {
            // Arrange
            const buildResult = geomGen.build(testNodes, null, state, false)

            // Act
            const indexAttribute = buildResult.mesh.geometry.index as BufferAttribute

            // Assert
            expect(indicesPerNode).toBe(30) // 5 visible faces × 6 indices
            expect(indexAttribute.count).toBe(testNodes.length * indicesPerNode)
        })

        it("should not reference bottom face vertices (8-11) in index buffer", () => {
            // Arrange — bottom face vertices are at offset 8-11 within each 24-vertex box
            const buildResult = geomGen.build(testNodes, null, state, false)
            const indexAttribute = buildResult.mesh.geometry.index as BufferAttribute
            const verticesPerBox = 24

            // Act & Assert — check each node's indices
            for (let node = 0; node < testNodes.length; node++) {
                const boxBase = node * verticesPerBox
                const bottomVertexStart = boxBase + 8
                const bottomVertexEnd = boxBase + 11

                for (let index = node * indicesPerNode; index < (node + 1) * indicesPerNode; index++) {
                    const vertexIndex = indexAttribute.getX(index)
                    const isBottomVertex = vertexIndex >= bottomVertexStart && vertexIndex <= bottomVertexEnd
                    expect(isBottomVertex).toBe(false)
                }
            }
        })
    })
})
