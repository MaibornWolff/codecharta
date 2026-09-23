import { klona } from "klona"
import { METRIC_DATA, STATE, VALID_NODE_WITH_PATH } from "../../../../mocks/dataMocks"
import { deepFreeze } from "../../../../mocks/deepFreeze"
import { CodeMapNode, LayoutAlgorithm, NodeType } from "../../../../model/codeCharta.model"
import { createExcludeMatcher } from "../../../../util/nodeRules/excludeMatcher"
import { StreetLayoutGenerator } from "./streetLayoutGenerator"

describe("horizontalStreet", () => {
    let codeMapNode: CodeMapNode
    const matcher = createExcludeMatcher([])

    beforeEach(() => {
        codeMapNode = klona(VALID_NODE_WITH_PATH)
        codeMapNode.path = "somePath"
    })
    describe("createStreetLayoutNodes", () => {
        it("should not call createTreeMap", () => {
            StreetLayoutGenerator.createStreetLayoutNodes(codeMapNode, STATE, METRIC_DATA, matcher, false)
            expect(StreetLayoutGenerator.createStreetLayoutNodes).toBeTruthy()
        })

        it("should call createTreeMap", () => {
            STATE.mapState.layoutAlgorithm = LayoutAlgorithm.TreeMapStreet
            StreetLayoutGenerator.createStreetLayoutNodes(codeMapNode, STATE, METRIC_DATA, matcher, false)
            expect(StreetLayoutGenerator.createStreetLayoutNodes).toBeTruthy()
        })
    })

    describe("laying out the map the store holds", () => {
        function mapWithSingleFolderChain(): CodeMapNode {
            return {
                name: "root",
                path: "/root",
                type: NodeType.FOLDER,
                attributes: { unary: 2 },
                children: [
                    {
                        name: "src",
                        path: "/root/src",
                        type: NodeType.FOLDER,
                        attributes: { unary: 2 },
                        children: [
                            {
                                name: "app",
                                path: "/root/src/app",
                                type: NodeType.FOLDER,
                                attributes: { unary: 2 },
                                children: [
                                    {
                                        name: "a.ts",
                                        path: "/root/src/app/a.ts",
                                        type: NodeType.FILE,
                                        attributes: { rloc: 100, mcc: 5, unary: 1 }
                                    },
                                    {
                                        name: "b.ts",
                                        path: "/root/src/app/b.ts",
                                        type: NodeType.FILE,
                                        attributes: { rloc: 50, mcc: 9, unary: 1 }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        }

        function layOut(map: CodeMapNode, layoutAlgorithm: LayoutAlgorithm) {
            const state = klona(STATE)
            state.mapState.layoutAlgorithm = layoutAlgorithm
            return StreetLayoutGenerator.createStreetLayoutNodes(map, state, METRIC_DATA, matcher, false)
        }

        it.each([
            LayoutAlgorithm.StreetMap,
            LayoutAlgorithm.TreeMapStreet
        ])("should leave the map untouched when laying it out as %s", layoutAlgorithm => {
            // Arrange
            const frozenMap = deepFreeze(mapWithSingleFolderChain())

            // Act
            const layOutFrozenMap = () => layOut(frozenMap, layoutAlgorithm)

            // Assert
            expect(layOutFrozenMap).not.toThrow()
        })

        it("should name a street that merges a folder with its only subfolder after both", () => {
            // Arrange
            const map = mapWithSingleFolderChain()

            // Act
            const nodes = layOut(map, LayoutAlgorithm.StreetMap)

            // Assert
            expect(nodes.find(node => node.path === "/root/src")?.name).toBe("root/src")
            expect(map.children[0].name).toBe("src")
        })
    })
})
