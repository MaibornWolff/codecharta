import { TEST_DELTA_MAP_A, VALID_NODE_WITH_PATH_AND_DELTAS } from "./dataMocks"
import {
    CCFile,
    CodeMapNode,
    NodeType,
    AttributeTypeValue,
    AttributeTypes,
    NodeMetricData,
    EdgeMetricData,
    MetricData
} from "../codeCharta.model"
import { NodeDecorator } from "./nodeDecorator"
import { HierarchyNode, hierarchy } from "d3-hierarchy"
import { clone } from "./clone"
import { UNARY_METRIC } from "../state/selectors/accumulatedData/metricData/nodeMetricData.calculator"

describe("nodeDecorator", () => {
    let file: CCFile
    let map: CodeMapNode
    let deltaMap: CodeMapNode
    let metricData: MetricData
    let nodeMetricData: NodeMetricData[]
    let edgeMetricData: EdgeMetricData[]
    let attributeTypes: AttributeTypes

    beforeEach(() => {
        file = clone(TEST_DELTA_MAP_A)
        map = file.map
        deltaMap = clone(VALID_NODE_WITH_PATH_AND_DELTAS)
        nodeMetricData = [
            { name: "rloc", maxValue: 999_999, minValue: 1, values: [1, 999_999] },
            { name: "functions", maxValue: 999_999, minValue: 1, values: [1, 999_999] },
            { name: "mcc", maxValue: 999_999, minValue: 1, values: [1, 999_999] }
        ]
        edgeMetricData = [
            { name: "pairingRate", maxValue: 999, minValue: 1, values: [1, 999_999] },
            { name: "avgCommits", maxValue: 999, minValue: 1, values: [1, 999_999] }
        ]
        metricData = { nodeMetricData, edgeMetricData }
        attributeTypes = {
            nodes: { functions: AttributeTypeValue.relative, rloc: AttributeTypeValue.absolute },
            edges: { pairingRate: AttributeTypeValue.relative }
        }
        NodeDecorator.decorateMapWithPathAttribute(file)
    })

    function allUniqueIds(map: HierarchyNode<CodeMapNode>) {
        const ids = new Set()
        let count = 0
        map.each(({ data }) => {
            count++
            ids.add(data.id)
        })
        return count === ids.size
    }

    describe("decorateMap", () => {
        it("nodes should have all metrics", () => {
            nodeMetricData.push({ name: "some", maxValue: 999_999, minValue: 1, values: [1, 999_999] })
            NodeDecorator.decorateMap(map, metricData, [])

            hierarchy(map).each(node => {
                expect(node.data.attributes).toBeDefined()
                expect(node.data.attributes.some).toBe(0)
                expect(node.data.attributes.rloc).toBeDefined()
                expect(node.data.attributes.functions).toBeDefined()
                expect(node.data.attributes.mcc).toBeDefined()
            })
        })

        it("nodes should have all metrics even if some attributesLists are undefined", () => {
            map.children[0].attributes = undefined
            nodeMetricData.push({ name: "some", maxValue: 999_999, minValue: 1, values: [1, 999_999] })

            NodeDecorator.decorateMap(map, metricData, [])

            hierarchy(map).each(node => {
                expect(node.data.attributes).toBeDefined()
                expect(node.data.attributes.some).toBe(0)
                expect(node.data.attributes.rloc).toBeDefined()
                expect(node.data.attributes.functions).toBeDefined()
                expect(node.data.attributes.mcc).toBeDefined()
            })
        })

        it("should compact from root", () => {
            map.children = [
                {
                    name: "middle",
                    type: NodeType.FOLDER,
                    attributes: {},
                    isExcluded: false,
                    isFlattened: false,
                    children: [
                        {
                            name: "a",
                            type: NodeType.FILE,
                            attributes: {},
                            isExcluded: false,
                            isFlattened: false
                        },
                        {
                            name: "b",
                            type: NodeType.FILE,
                            attributes: {},
                            isExcluded: false,
                            isFlattened: false
                        }
                    ]
                }
            ]
            NodeDecorator.decorateMapWithPathAttribute(file)

            NodeDecorator.decorateMap(map, metricData, [])

            expect(map.name).toBe("root/middle")
            expect(map.children.length).toBe(2)
            expect(map.children[0].name).toBe("a")
            expect(map.children[1].name).toBe("b")
        })

        it("should collect links correctly", () => {
            map.link = "link0"
            map.children = [
                {
                    name: "middle",
                    type: NodeType.FILE,
                    attributes: {},
                    link: "link1",
                    isExcluded: false,
                    isFlattened: false,
                    children: [
                        {
                            name: "a",
                            type: NodeType.FILE,
                            attributes: {},
                            isExcluded: false,
                            isFlattened: false
                        },
                        {
                            name: "b",
                            type: NodeType.FILE,
                            attributes: {},
                            isExcluded: false,
                            isFlattened: false
                        }
                    ]
                }
            ]
            NodeDecorator.decorateMapWithPathAttribute(file)

            NodeDecorator.decorateMap(map, metricData, [])

            expect(map.link).toBe("link1")
        })

        it("should collect paths correctly", () => {
            map.path = "/root"
            map.children = [
                {
                    name: "middle",
                    path: "/root/middle",
                    type: NodeType.FOLDER,
                    attributes: {},
                    isExcluded: false,
                    isFlattened: false,
                    children: [
                        {
                            name: "a",
                            type: NodeType.FILE,
                            path: "/root/middle/a",
                            attributes: {},
                            isExcluded: false,
                            isFlattened: false
                        },
                        {
                            name: "b",
                            type: NodeType.FILE,
                            path: "/root/middle/b",
                            attributes: {},
                            isExcluded: false,
                            isFlattened: false
                        }
                    ]
                }
            ]

            NodeDecorator.decorateMap(map, metricData, [])

            expect(map.path).toBe("/root/middle")
        })

        it("should not compact with single leaves", () => {
            map.children = [
                {
                    name: "middle",
                    type: NodeType.FOLDER,
                    attributes: {},
                    isExcluded: false,
                    isFlattened: false,
                    children: [
                        {
                            name: "singleLeaf",
                            type: NodeType.FILE,
                            attributes: {},
                            isExcluded: false,
                            isFlattened: false
                        }
                    ]
                }
            ]
            NodeDecorator.decorateMapWithPathAttribute(file)

            NodeDecorator.decorateMap(map, metricData, [])

            expect(map.name).toBe("root/middle")
            expect(map.children.length).toBe(1)
            expect(map.children[0].name).toBe("singleLeaf")
        })

        it("should compact intermediate middle packages", () => {
            map.children = [
                {
                    name: "start",
                    type: NodeType.FOLDER,
                    attributes: {},
                    isExcluded: false,
                    isFlattened: false,
                    children: [
                        {
                            name: "middle",
                            type: NodeType.FOLDER,
                            attributes: {},
                            isExcluded: false,
                            isFlattened: false,
                            children: [
                                {
                                    name: "middle2",
                                    type: NodeType.FOLDER,
                                    attributes: {},
                                    isExcluded: false,
                                    isFlattened: false,
                                    children: [
                                        {
                                            name: "a",
                                            type: NodeType.FILE,
                                            attributes: {},
                                            isExcluded: false,
                                            isFlattened: false
                                        },
                                        {
                                            name: "b",
                                            type: NodeType.FILE,
                                            attributes: {},
                                            isExcluded: false,
                                            isFlattened: false
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            name: "c",
                            type: NodeType.FILE,
                            attributes: {},
                            isExcluded: false,
                            isFlattened: false
                        }
                    ]
                }
            ]
            NodeDecorator.decorateMapWithPathAttribute(file)

            NodeDecorator.decorateMap(map, metricData, [])

            expect(map.name).toBe("root/start")
            expect(map.children.length).toBe(2)
            expect(map.children[0].name).toBe("middle/middle2")
            expect(map.children[1].name).toBe("c")
            expect(map.children[0].children.length).toBe(2)
            expect(map.children[0].children[0].name).toBe("a")
            expect(map.children[0].children[1].name).toBe("b")
        })

        it("should decorate nodes with a unique id starting from 0", () => {
            NodeDecorator.decorateMap(
                file.map,
                {
                    nodeMetricData: [],
                    edgeMetricData: []
                },
                []
            )

            const h = hierarchy(file.map)
            h.each(node => {
                expect(node.data.id).toBeDefined()
            })
            expect(allUniqueIds(h)).toBeTruthy()
            expect(file.map.id).toBe(0)
        })

        it("all nodes should have a unary attribute and all leaves should have it set to 1", () => {
            metricData.nodeMetricData.push({ name: UNARY_METRIC, maxValue: 1, minValue: 1, values: [1, 1] })

            NodeDecorator.decorateMap(map, metricData, [])

            const h = hierarchy(map)
            h.each(({ data }) => {
                expect(data.attributes[UNARY_METRIC]).toBeDefined()
            })
            for (const { data } of h.leaves()) {
                expect(data.attributes[UNARY_METRIC]).toBe(1)
            }
        })
    })

    describe("decorateMapWithPathAttribute", () => {
        it("should decorate nodes with the correct path", () => {
            NodeDecorator.decorateMapWithPathAttribute(file)

            const h = hierarchy(file.map)
            h.each(node => {
                expect(node.data.path).toBeDefined()
            })

            expect(file.map.path).toBe("/root")
            expect(file.map.children[1].children[0].path).toBe("/root/Parent Leaf/small leaf")
        })
    })

    describe("decorateParentNodesWithAggregatedAttributes", () => {
        it("all nodes should have an attribute list with all possible metrics", () => {
            map.children[0].attributes = undefined
            map.children[1].attributes = { some: 1 }
            nodeMetricData.push({ name: "some", maxValue: 999_999, minValue: 1, values: [1, 999_999] })
            NodeDecorator.decorateMap(map, metricData, [])

            NodeDecorator.decorateParentNodesWithAggregatedAttributes(map, false, attributeTypes)

            const h = hierarchy(map)
            h.each(node => {
                expect(node.data.attributes).toBeDefined()
                expect(node.data.attributes.some).toBeDefined()
            })
        })

        it("all nodes should have an attribute list with listed and available metrics", () => {
            NodeDecorator.decorateMap(map, metricData, [])

            NodeDecorator.decorateParentNodesWithAggregatedAttributes(map, false, attributeTypes)

            const h = hierarchy(map)
            h.each(node => {
                expect(node.data.attributes).toBeDefined()
                expect(node.data.attributes.rloc).toBeDefined()
                expect(node.data.attributes.functions).toBeDefined()
            })
        })

        it("folders should have sum attributes of children for absolute metrics", () => {
            NodeDecorator.decorateMap(map, metricData, [])

            NodeDecorator.decorateParentNodesWithAggregatedAttributes(map, false, attributeTypes)

            const h = hierarchy(map)
            expect(h.data.attributes.rloc).toBe(200)
            expect(h.children[0].data.attributes.rloc).toBe(100)
        })

        it("folders should have median attributes of children for relative metrics", () => {
            NodeDecorator.decorateMap(map, metricData, [])

            NodeDecorator.decorateParentNodesWithAggregatedAttributes(map, false, attributeTypes)

            const h = hierarchy(map)
            expect(h.data.attributes.functions).toBe(100)
        })

        it("folders should have sum delta values of children for absolute metrics", () => {
            NodeDecorator.decorateMap(deltaMap, metricData, [])

            NodeDecorator.decorateParentNodesWithAggregatedAttributes(deltaMap, true, attributeTypes)

            const actualDeltaMapWithAggregatedAttributes = hierarchy(deltaMap)

            expect(actualDeltaMapWithAggregatedAttributes.data.deltas.rloc).toBe(295)
            expect(actualDeltaMapWithAggregatedAttributes.data.fileCount.added).toBe(1)
            expect(actualDeltaMapWithAggregatedAttributes.data.fileCount.removed).toBe(3)
            expect(actualDeltaMapWithAggregatedAttributes.data.fileCount.changed).toBe(2)
            expect(actualDeltaMapWithAggregatedAttributes.children[0].data.deltas.rloc).toBe(300)
        })

        it("folders should have median delta values of children for relative metrics", () => {
            NodeDecorator.decorateMap(deltaMap, metricData, [])

            NodeDecorator.decorateParentNodesWithAggregatedAttributes(deltaMap, true, attributeTypes)

            const h = hierarchy(deltaMap)
            expect(h.data.deltas.functions).toBe(-3)
        })

        it("should aggregate given absolute metrics correctly", () => {
            NodeDecorator.decorateMap(map, metricData, [])

            NodeDecorator.decorateParentNodesWithAggregatedAttributes(map, false, attributeTypes)

            expect(map.attributes.rloc).toBe(200)
            expect(map.attributes.mcc).toBe(111)
        })

        it("should aggregate given relative metrics correctly", () => {
            NodeDecorator.decorateMap(map, metricData, [])

            NodeDecorator.decorateParentNodesWithAggregatedAttributes(map, false, attributeTypes)

            expect(map.attributes.functions).toBe(100)
        })

        it("should aggregate absolute edge metrics correctly", () => {
            map.children[0].edgeAttributes = { avgCommits: { incoming: 12, outgoing: 13 } }
            map.children[1].children[0].edgeAttributes = { avgCommits: { incoming: 10, outgoing: 10 } }
            NodeDecorator.decorateMap(map, metricData, [])

            NodeDecorator.decorateParentNodesWithAggregatedAttributes(map, false, attributeTypes)

            expect(map.edgeAttributes.avgCommits.incoming).toBe(22)
            expect(map.edgeAttributes.avgCommits.outgoing).toBe(23)
        })

        it("should aggregate given relative edge metrics correctly", () => {
            map.children[0].edgeAttributes = { pairingRate: { incoming: 12, outgoing: 13 } }
            map.children[1].children[0].edgeAttributes = { pairingRate: { incoming: 10, outgoing: 10 } }
            NodeDecorator.decorateMap(map, metricData, [])

            NodeDecorator.decorateParentNodesWithAggregatedAttributes(map, false, attributeTypes)

            expect(map.edgeAttributes.pairingRate.incoming).toBe(11)
            expect(map.edgeAttributes.pairingRate.outgoing).toBe(11.5)
        })

        it("should aggregate missing metrics correctly", () => {
            nodeMetricData.push({ name: "some", maxValue: 999_999, minValue: 1, values: [1, 999_999] })
            NodeDecorator.decorateMap(map, metricData, [])

            NodeDecorator.decorateParentNodesWithAggregatedAttributes(map, false, attributeTypes)

            expect(map.attributes.rloc).toBe(200)
            expect(map.attributes.some).toBe(0)
            expect(map.attributes["some other attribute"]).not.toBeDefined()
        })
    })

    describe("blacklist", () => {
        it("should calculate flatten and exclude state for every node", () => {
            NodeDecorator.decorateMap(file.map, { nodeMetricData: [], edgeMetricData: [] }, [
                { type: "flatten", path: "small leaf" },
                { type: "exclude", path: "other small leaf" }
            ])
            expect(file.map.children[0].isExcluded).toBe(false)
            expect(file.map.children[0].isFlattened).toBe(false)
            expect(file.map.children[1].children[0].isFlattened).toBe(true)
            expect(file.map.children[1].children[1].isExcluded).toBe(true)
        })
    })
})
