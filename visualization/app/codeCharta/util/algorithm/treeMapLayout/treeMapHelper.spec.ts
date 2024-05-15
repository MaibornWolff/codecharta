import { TreeMapHelper } from "./treeMapHelper"
import { CodeMapNode, ColorMode, EdgeVisibility, NodeType, CcState } from "../../../codeCharta.model"
import { CODE_MAP_BUILDING, STATE } from "../../dataMocks"
import { HierarchyRectangularNode } from "d3-hierarchy"
import { clone } from "../../clone"

jest.mock("../../../state/selectors/accumulatedData/accumulatedData.selector", () => ({
    accumulatedDataSelector: () => ({
        unifiedMapNode: {
            name: "Anode",
            path: "/root/Anode",
            type: "File",
            attributes: { theHeight: 100 },
            isExcluded: false,
            isFlattened: false
        }
    })
}))
jest.mock("../../../state/selectors/accumulatedData/metricData/selectedColorMetricData.selector", () => ({
    selectedColorMetricDataSelector: () => ({ minValue: 0, maxValue: 100 })
}))

describe("TreeMapHelper", () => {
    describe("build node", () => {
        let codeMapNode: CodeMapNode
        let squaredNode: HierarchyRectangularNode<CodeMapNode>
        let state: CcState

        const heightScale = 1
        const maxHeight = 2000
        const isDeltaState = false

        beforeEach(() => {
            codeMapNode = {
                name: "Anode",
                path: "/root/Anode",
                type: NodeType.FILE,
                attributes: { theHeight: 100 },
                isExcluded: false,
                isFlattened: false
            }

            squaredNode = {
                data: codeMapNode,
                value: 42,
                x0: 0,
                y0: 0,
                x1: 400,
                y1: 400
            } as HierarchyRectangularNode<CodeMapNode>

            state = clone(STATE)
            state.dynamicSettings.margin = 15
            state.dynamicSettings.heightMetric = "theHeight"
            state.appSettings.invertHeight = false
            state.dynamicSettings.focusedNodePath = []
        })

        function buildNode() {
            return TreeMapHelper.buildNodeFrom(squaredNode, heightScale, maxHeight, state, isDeltaState)
        }

        it("minimal", () => {
            expect(buildNode()).toMatchSnapshot()
        })

        it("invertHeight", () => {
            state.appSettings.invertHeight = true
            expect(buildNode()).toMatchSnapshot()
        })

        it("should invert height when heightmetric indicates a positive direction", () => {
            state.dynamicSettings.heightMetric = "branch_coverage"
            state.fileSettings.attributeDescriptors = {
                branch_coverage: {
                    title: "Branch Coverage",
                    description: "",
                    hintLowValue: "",
                    hintHighValue: "",
                    link: "",
                    direction: 1
                }
            }
            expect(buildNode().height).toBe(maxHeight)
        })

        it("deltas", () => {
            squaredNode.data.deltas = {}
            state.dynamicSettings.heightMetric = "theHeight"
            squaredNode.data.deltas[state.dynamicSettings.heightMetric] = 33
            expect(buildNode()).toMatchSnapshot()
        })

        it("given negative deltas the resulting heightDelta also should be negative", () => {
            squaredNode.data.deltas = {}
            squaredNode.data.deltas[state.dynamicSettings.heightMetric] = -33
            expect(buildNode().heightDelta).toBe(-33)
        })

        it("should set lowest possible height caused by other visible edge pairs", () => {
            state.fileSettings.edges = [
                {
                    fromNodeName: "/root/AnotherNode1",
                    toNodeName: "/root/AnotherNode2",
                    attributes: {
                        pairingRate: 33,
                        avgCommits: 12
                    },
                    visible: EdgeVisibility.both
                }
            ]
            expect(buildNode()).toMatchSnapshot()
        })

        it("should set markingColor according to markedPackages", () => {
            const color = "#FF0000"
            state.fileSettings.markedPackages = [
                {
                    path: "/root/Anode",
                    color
                }
            ]
            expect(buildNode().markingColor).toEqual(color)
        })

        it("should set no markingColor according to markedPackages", () => {
            const color = "#FF0000"
            state.fileSettings.markedPackages = [
                {
                    path: "/root/AnotherNode",
                    color
                }
            ]
            expect(buildNode().markingColor).toEqual(undefined)
        })

        it("should be visible if it's a children of the focused node path", () => {
            state.dynamicSettings.focusedNodePath = ["/root"]
            expect(buildNode().visible).toBeTruthy()
        })

        it("should not be visible if it's excluded", () => {
            codeMapNode.isExcluded = true
            expect(buildNode().visible).toBeFalsy()
        })

        it("should be visible if it's not excluded and no focused node path is given", () => {
            expect(buildNode().visible).toBeTruthy()
        })

        describe("isNodeToBeFlat", () => {
            beforeEach(() => {
                codeMapNode = {
                    name: "Anode",
                    path: "/root/Anode",
                    type: NodeType.FILE,
                    attributes: {},
                    edgeAttributes: { pairingRate: { incoming: 42, outgoing: 23 } },
                    isExcluded: false,
                    isFlattened: false
                }

                squaredNode = {
                    data: codeMapNode,
                    value: 42,
                    x0: 0,
                    y0: 0,
                    x1: 400,
                    y1: 400
                } as HierarchyRectangularNode<CodeMapNode>

                state.dynamicSettings.margin = 15
            })

            it("should not be a flat node when no visibleEdges", () => {
                state.fileSettings.edges = []
                expect(buildNode().flat).toBeFalsy()
            })

            it("should be a flat node when other edges are visible", () => {
                state.appSettings.showOnlyBuildingsWithEdges = true
                state.fileSettings.edges = [
                    {
                        fromNodeName: "/root/anotherNode",
                        toNodeName: "/root/anotherNode2",
                        attributes: {},
                        visible: EdgeVisibility.both
                    }
                ]
                expect(buildNode().flat).toBeTruthy()
            })

            it("should not be a flat node when it contains edges", () => {
                state.fileSettings.edges = [
                    {
                        fromNodeName: "/root/Anode",
                        toNodeName: "/root/anotherNode",
                        attributes: {}
                    }
                ]
                expect(buildNode().flat).toBeFalsy()
            })

            it("should not be a flat node, because its searched for", () => {
                state.dynamicSettings.searchPattern = "/root/Anode"
                expect(buildNode().flat).toBeFalsy()
            })

            it("should be a flat node, because other nodes are searched for", () => {
                state.dynamicSettings.searchPattern = "/root/anotherNode2"
                expect(buildNode().flat).toBeTruthy()
            })

            it("should not be a flat node when searchPattern is empty", () => {
                state.dynamicSettings.searchPattern = ""
                expect(buildNode().flat).toBeFalsy()
            })

            it("should be flat if node is flattened in blacklist", () => {
                state.fileSettings.blacklist = [{ path: "*Anode", type: "flatten" }]
                squaredNode.data.isFlattened = true

                expect(buildNode().flat).toBeTruthy()
            })

            it("should not be flat if node is not blacklisted", () => {
                state.fileSettings.blacklist = []

                expect(buildNode().flat).toBeFalsy()
            })
        })

        describe("getBuildingColor", () => {
            let node: CodeMapNode

            beforeEach(() => {
                node = {
                    name: "Anode",
                    path: "/root/Anode",
                    type: NodeType.FILE,
                    attributes: {}
                } as CodeMapNode

                squaredNode.data = node

                node.attributes = { validMetricName: 0 }

                state.dynamicSettings.colorRange.from = 5
                state.dynamicSettings.colorRange.to = 10
                state.dynamicSettings.colorMetric = "validMetricName"
            })

            describe("generics", () => {
                it("creates grey building for undefined colorMetric", () => {
                    state.dynamicSettings.colorMetric = "invalid"
                    expect(buildNode().color).toBe(state.appSettings.mapColors.base)
                })

                it("creates flat colored building", () => {
                    state.fileSettings.blacklist = [{ path: "*Anode", type: "flatten" }]
                    squaredNode.data.isFlattened = true

                    expect(buildNode().color).toBe(state.appSettings.mapColors.flat)
                })
            })

            describe("absolute colors", () => {
                beforeEach(() => {
                    state.dynamicSettings.colorMode = ColorMode.absolute
                })

                it("creates green colored building colorMetricValue < colorRangeFrom", () => {
                    expect(buildNode().color).toBe(state.appSettings.mapColors.positive)
                })

                it("creates neutral colored building colorMetricValue === colorRangeFrom", () => {
                    node.attributes = { validMetricName: state.dynamicSettings.colorRange.from }

                    expect(buildNode().color).toBe(state.appSettings.mapColors.neutral)
                })

                it("creates neutral colored building", () => {
                    node.attributes = { validMetricName: state.dynamicSettings.colorRange.from + 1 }

                    expect(buildNode().color).toBe(state.appSettings.mapColors.neutral)
                })

                it("creates red colored building colorMetricValue === colorRangeTo", () => {
                    node.attributes = { validMetricName: state.dynamicSettings.colorRange.to }

                    expect(buildNode().color).toBe(state.appSettings.mapColors.negative)
                })

                it("creates red colored building colorMetricValue > colorRangeTo", () => {
                    node.attributes = { validMetricName: state.dynamicSettings.colorRange.to + 1 }

                    expect(buildNode().color).toBe(state.appSettings.mapColors.negative)
                })
            })

            describe("weighted gradient", () => {
                beforeEach(() => {
                    state.dynamicSettings.colorMode = ColorMode.weightedGradient
                })

                it("colors green to yellow to red according to weighted gradient", () => {
                    const { positive, neutral, negative } = state.appSettings.mapColors
                    const { from, to } = state.dynamicSettings.colorRange
                    const endPositive = Math.max(from - (to - from) / 2, from / 2)
                    const startNeutral = 2 * from - endPositive
                    const endNeutral = to - (to - from) / 2
                    const startNegative = to

                    node.attributes = { validMetricName: 0 }
                    expect(buildNode().color).toBe(positive)

                    node.attributes = { validMetricName: endPositive }
                    expect(buildNode().color).toBe(positive)

                    node.attributes = { validMetricName: endPositive + 0.1 }
                    expect(buildNode().color).toBe("#6baf3f")

                    node.attributes = { validMetricName: startNeutral - 0.1 }
                    expect(buildNode().color).toBe("#dbcb01")

                    node.attributes = { validMetricName: startNeutral }
                    expect(buildNode().color).toBe(neutral)

                    node.attributes = { validMetricName: endNeutral }
                    expect(buildNode().color).toBe(neutral)

                    node.attributes = { validMetricName: endNeutral + 0.1 }
                    expect(buildNode().color).toBe("#d9c401")

                    node.attributes = { validMetricName: startNegative - 0.1 }
                    expect(buildNode().color).toBe("#86160d")

                    node.attributes = { validMetricName: startNegative }
                    expect(buildNode().color).toBe(negative)

                    node.attributes = { validMetricName: 100 }
                    expect(buildNode().color).toBe(negative)
                })
            })

            describe("true gradient", () => {
                beforeEach(() => {
                    state.dynamicSettings.colorMode = ColorMode.trueGradient
                })

                it("colors greenish to yellow color according to true gradient", () => {
                    const { from, to } = state.dynamicSettings.colorRange
                    const middle = (from + to) / 2

                    node.attributes = { validMetricName: 0 }
                    expect(buildNode().color).toBe(state.appSettings.mapColors.positive.toLowerCase())

                    node.attributes = { validMetricName: 1 }
                    expect(buildNode().color).toBe("#78b237")

                    node.attributes = { validMetricName: middle - 1 }
                    expect(buildNode().color).toBe("#cec809")

                    node.attributes = { validMetricName: middle }
                    expect(buildNode().color).toBe(state.appSettings.mapColors.neutral)

                    node.attributes = { validMetricName: middle + 1 }
                    expect(buildNode().color).toBe("#dcca00")
                })

                it("colors a reddish color according to true gradient", () => {
                    const { to } = state.dynamicSettings.colorRange

                    node.attributes = { validMetricName: to + 1 }
                    expect(buildNode().color).toBe("#dac501")

                    node.attributes = { validMetricName: 99 }
                    expect(buildNode().color).toBe("#83100e")

                    node.attributes = { validMetricName: 100 }
                    expect(buildNode().color).toBe("#820e0e")
                })
            })

            describe("focused gradient", () => {
                beforeEach(() => {
                    state.dynamicSettings.colorMode = ColorMode.focusedGradient
                })

                it("colors green below from threshold, red over to threshold and gradient in between", () => {
                    const { from, to } = state.dynamicSettings.colorRange
                    const middle = (from + to) / 2

                    node.attributes = { validMetricName: from }
                    expect(buildNode().color.toLowerCase()).toBe("#97ba26")

                    node.attributes = { validMetricName: from - 1 }
                    expect(buildNode().color.toLowerCase()).toBe(state.appSettings.mapColors.positive.toLowerCase())

                    node.attributes = { validMetricName: middle - 1 }
                    expect(buildNode().color).toBe("#a5be1f")

                    node.attributes = { validMetricName: middle }
                    expect(buildNode().color).toBe(state.appSettings.mapColors.neutral)

                    node.attributes = { validMetricName: middle + 1 }
                    expect(buildNode().color).toBe("#b98006")

                    node.attributes = { validMetricName: to }
                    expect(buildNode().color.toLowerCase()).toBe(state.appSettings.mapColors.negative.toLowerCase())

                    node.attributes = { validMetricName: to + 1 }
                    expect(buildNode().color.toLowerCase()).toBe(state.appSettings.mapColors.negative.toLowerCase())
                })
            })
        })
    })

    describe("count nodes", () => {
        it("root only should be 1", () => {
            const root = {}
            expect(TreeMapHelper.countNodes(root)).toBe(1)
        })

        it("root plus child should be 2", () => {
            const root: CodeMapNode = {
                children: [{ name: "Foo", type: NodeType.FILE }],
                name: "root",
                type: NodeType.FOLDER
            }
            expect(TreeMapHelper.countNodes(root)).toBe(2)
        })

        it("root plus child in child should be 3", () => {
            const root: CodeMapNode = {
                children: [{ children: [{ name: "Foo", type: NodeType.FILE }], name: "Foo", type: NodeType.FILE }],
                name: "root",
                type: NodeType.FOLDER
            }
            expect(TreeMapHelper.countNodes(root)).toBe(3)
        })

        it("root plus two children should be 3", () => {
            const root: CodeMapNode = {
                children: [
                    { name: "Foo", type: NodeType.FILE },
                    { name: "Bar", type: NodeType.FILE }
                ],
                name: "root",
                type: NodeType.FOLDER
            }
            expect(TreeMapHelper.countNodes(root)).toBe(3)
        })
    })

    describe("resolve height value", () => {
        const state = STATE
        state.dynamicSettings.heightMetric = "rloc"
        const someNode: CodeMapNode = {
            deltas: {
                mcc: 42
            },
            name: "",
            type: NodeType.FILE
        }

        it("should use MIN_BUILDING_HEIGHT if no delta", () => {
            const resultHeight = TreeMapHelper.resolveHeightValue(1, 1, someNode, state)

            expect(resultHeight).toBe(TreeMapHelper.MIN_BUILDING_HEIGHT)
        })

        it("should produce positive height value if big enough", () => {
            const stateMCC = clone(state)
            stateMCC.dynamicSettings.heightMetric = "mcc"

            const resultHeightWithDelta = TreeMapHelper.resolveHeightValue(10, 1, someNode, stateMCC)
            const resultHeightWithoutDelta = TreeMapHelper.resolveHeightValue(10, 1, someNode, state)

            expect(resultHeightWithDelta).toBe(10)
            expect(resultHeightWithoutDelta).toBe(10)
        })

        it("should use zero as min height if delta present", () => {
            state.dynamicSettings.heightMetric = "mcc"
            const resultHeightZero = TreeMapHelper.resolveHeightValue(0, 1, someNode, state)
            const resultHeightPositive = TreeMapHelper.resolveHeightValue(10, 1, someNode, state)

            expect(resultHeightZero).toBe(0)
            expect(resultHeightPositive).toBe(10)
        })
    })

    describe("buildingArrayToMap", () => {
        it("should convert a array of buildings to a map", () => {
            const result = TreeMapHelper.buildingArrayToMap([CODE_MAP_BUILDING])

            expect(result.get(CODE_MAP_BUILDING.id)).toEqual(CODE_MAP_BUILDING)
        })
    })
})
