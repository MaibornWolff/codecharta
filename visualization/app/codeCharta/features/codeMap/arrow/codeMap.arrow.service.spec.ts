import { TestBed } from "@angular/core/testing"
import { State, Store, StoreModule } from "@ngrx/store"
import { Object3D, Vector3 } from "three"
import { edgesSelector } from "../../../lenses/dependency/dependencyLens.facade"
import { DIFFERENT_NODE, INCOMING_NODE, OUTGOING_NODE, VALID_EDGES_DECORATED } from "../../../mocks/dataMocks"
import { CcState, Node } from "../../../model/codeCharta.model"
import { CodeMapBuilding } from "../../../renderer/threeViewer/rendering/codeMapBuilding"
import {
    CODE_MAP_BUILDING,
    CODE_MAP_BUILDING_WITH_INCOMING_EDGE_NODE,
    CODE_MAP_BUILDING_WITH_OUTGOING_EDGE_NODE
} from "../../../renderer/threeViewer/rendering/codeMapBuilding.mocks"
import { CodeMapMesh } from "../../../renderer/threeViewer/rendering/codeMapMesh"
import { ThreeSceneService } from "../../../renderer/threeViewer/threeSceneService"
import {
    setEdgeMetric,
    setHeightMetric,
    setScaling,
    setShowIncomingEdges,
    setShowOutgoingEdges,
    toggleEdgeMetricVisible
} from "../../../stores/mapState/mapState.write.facade"
import { appReducers, setStateMiddleware } from "../../../stores/rootStore/store"
import { SharedViewReadWindow } from "../../../stores/sharedView/sharedView.read.facade"
import { clone } from "../../../util/clone"
import { ColorConverter } from "../../../util/color/colorConverter"
import { wait } from "../../../util/testUtils/wait"
import { CodeMapStore } from "../stores/codeMap.store"
import { CodeMapArrowService } from "./codeMap.arrow.service"

// Slice 15e: edges derives from files via the dependency lens; mock the selector to inject edges directly.
jest.mock("../../../lenses/dependency/store/edges.selector", () => ({ edgesSelector: jest.fn(() => []) }))

describe("CodeMapArrowService", () => {
    let codeMapArrowService: CodeMapArrowService
    let threeSceneService: ThreeSceneService
    let store: Store<CcState>
    let state: State<CcState>

    beforeEach(() => {
        // Default to no edges (mirrors the fresh store) — the constructor subscribes immediately, and a
        // mockReturnValue set by a prior test would otherwise leak in before this.map is populated.
        ;(edgesSelector as unknown as jest.Mock).mockReturnValue([])
        TestBed.configureTestingModule({
            imports: [StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]
        })
        threeSceneService = TestBed.inject(ThreeSceneService)
        store = TestBed.inject(Store)
        state = TestBed.inject(State)
        const codeMapStore = TestBed.inject(CodeMapStore)
        const sharedViewReadWindow = TestBed.inject(SharedViewReadWindow)
        codeMapArrowService = new CodeMapArrowService(codeMapStore, sharedViewReadWindow, threeSceneService)
    })

    function withMockedThreeSceneService() {
        threeSceneService = jest.fn().mockReturnValue({
            edgeArrows: {
                children: [],
                add: jest.fn()
            },
            highlightedBuildings: [],
            getMapMesh: jest.fn().mockReturnValue({
                getMeshDescription: jest.fn().mockReturnValue({ getBuildingByPath: jest.fn() }),
                clearHighlight: jest.fn(),
                clearUnselectedBuildings: jest.fn(),
                clearSelection: jest.fn(),
                selectBuilding: jest.fn()
            }),
            applyHighlights: jest.fn(),
            addBuildingsToHighlightingList: jest.fn(),
            getSelectedBuilding: jest.fn().mockReturnValue({
                value: "value"
            })
        })()
        Object.defineProperty(codeMapArrowService, "threeSceneService", { value: threeSceneService })
    }

    function setupEdgeArrowsWithChildren() {
        const dummyObject3D = new Object3D()
        threeSceneService.edgeArrows.children = [dummyObject3D, dummyObject3D]
    }

    function setupArrows() {
        const dummyObject3D = new Object3D()
        codeMapArrowService["arrows"] = [dummyObject3D, dummyObject3D]
    }

    describe("constructor", () => {
        it("should assign arrows an empty array", () => {
            expect(codeMapArrowService["arrows"].length).toBe(0)
        })
    })

    describe("addArrow", () => {
        it("should add an arrow even when the height-metric value of both nodes is 0", () => {
            // Arrange — a height value of 0 is valid, the edge must still be drawn
            withMockedThreeSceneService()
            store.dispatch(setHeightMetric({ value: "mcc" }))
            const originNode: Node = { ...OUTGOING_NODE, attributes: { ...OUTGOING_NODE.attributes, mcc: 0 } }
            const targetNode: Node = { ...INCOMING_NODE, attributes: { ...INCOMING_NODE.attributes, mcc: 0 } }

            // Act
            codeMapArrowService.addArrow(originNode, targetNode, true)

            // Assert
            expect(threeSceneService.edgeArrows.add).toHaveBeenCalled()
        })

        it("should add an arrow even when a node lacks the selected height metric", () => {
            // Arrange — an edge is a file relationship; it does not depend on the height metric being present
            withMockedThreeSceneService()
            store.dispatch(setHeightMetric({ value: "mcc" }))
            const originNode: Node = { ...OUTGOING_NODE, attributes: {} }
            const targetNode: Node = { ...INCOMING_NODE, attributes: {} }

            // Act
            codeMapArrowService.addArrow(originNode, targetNode, true)

            // Assert
            expect(threeSceneService.edgeArrows.add).toHaveBeenCalled()
        })
    })

    describe("Arrow Behaviour when selecting and hovering a building", () => {
        it("should only highlight small leaf when big leaf is selected", async () => {
            ;(edgesSelector as unknown as jest.Mock).mockReturnValue(VALID_EDGES_DECORATED)
            const nodes: Node[] = [
                CODE_MAP_BUILDING_WITH_OUTGOING_EDGE_NODE.node,
                CODE_MAP_BUILDING_WITH_INCOMING_EDGE_NODE.node,
                DIFFERENT_NODE
            ]
            threeSceneService["mapMesh"] = new CodeMapMesh(nodes, state.getValue(), false)
            codeMapArrowService.addEdgeMapBasedOnNodes(nodes)
            codeMapArrowService.addEdgePreview()
            store.dispatch(setHeightMetric({ value: "mcc" }))

            threeSceneService.selectBuilding(CODE_MAP_BUILDING_WITH_OUTGOING_EDGE_NODE)
            codeMapArrowService.onBuildingHovered(CODE_MAP_BUILDING_WITH_OUTGOING_EDGE_NODE)

            await wait(codeMapArrowService["HIGHLIGHT_BUILDING_DELAY"])

            expect(threeSceneService["highlighted"]).toMatchSnapshot()
            expect(threeSceneService["selected"]).toMatchSnapshot()
        })
        it("should restore to previous color if another building is selected in delta mode", async () => {
            const nodes: Node[] = [
                CODE_MAP_BUILDING_WITH_OUTGOING_EDGE_NODE.node,
                CODE_MAP_BUILDING_WITH_INCOMING_EDGE_NODE.node,
                DIFFERENT_NODE
            ]
            threeSceneService["mapMesh"] = new CodeMapMesh(nodes, state.getValue(), true)

            store.dispatch(setHeightMetric({ value: "mcc" }))

            threeSceneService.selectBuilding(CODE_MAP_BUILDING_WITH_OUTGOING_EDGE_NODE)
            threeSceneService.selectBuilding(CODE_MAP_BUILDING_WITH_INCOMING_EDGE_NODE)

            expect(threeSceneService["selected"]).toMatchSnapshot()
            expect(threeSceneService["mapMesh"].getBuildingByPath(CODE_MAP_BUILDING_WITH_OUTGOING_EDGE_NODE.node.path)).toMatchSnapshot()
        })
        it("should debounce the edge reset of buildings to improve performance", async () => {
            const resetEdgesOfBuildingMock = jest.fn()
            Object.defineProperty(codeMapArrowService, "resetEdgesOfBuildings", {
                value: resetEdgesOfBuildingMock,
                writable: true,
                configurable: true
            })
            codeMapArrowService.onBuildingHovered(CODE_MAP_BUILDING_WITH_OUTGOING_EDGE_NODE)

            expect(resetEdgesOfBuildingMock).not.toHaveBeenCalled()

            await wait(codeMapArrowService["HIGHLIGHT_BUILDING_DELAY"])

            expect(resetEdgesOfBuildingMock).toHaveBeenCalled()
        })
        it("should only add outgoing edges when showOutgoingEdges is true and node has originNode path", () => {
            withMockedThreeSceneService()
            codeMapArrowService.addArrow = jest.fn()

            const outgoingNode: Node = OUTGOING_NODE
            const incomingNode: Node = INCOMING_NODE
            const nodesMap = new Map<string, Node>()
            nodesMap.set(outgoingNode.path, outgoingNode)
            nodesMap.set(incomingNode.path, incomingNode)
            codeMapArrowService["map"] = nodesMap

            store.dispatch(setShowOutgoingEdges({ value: true }))
            store.dispatch(setShowIncomingEdges({ value: false }))
            store.dispatch(setEdgeMetric({ value: "dependencies" }))
            ;(edgesSelector as unknown as jest.Mock).mockReturnValue([
                { fromNodeName: outgoingNode.path, toNodeName: incomingNode.path, attributes: { dependencies: 2 } }
            ])

            codeMapArrowService["buildPairingEdges"](nodesMap)

            expect(codeMapArrowService.addArrow).toHaveBeenCalledTimes(1)
            expect(codeMapArrowService.addArrow).toHaveBeenCalledWith(outgoingNode, incomingNode, true)
        })

        it("should only add incoming edges when showIncomingEdges is true and node has targetNode path", () => {
            withMockedThreeSceneService()
            codeMapArrowService.addArrow = jest.fn()

            const outgoingNode: Node = OUTGOING_NODE
            const incomingNode: Node = INCOMING_NODE
            const nodesMap = new Map<string, Node>()
            nodesMap.set(outgoingNode.path, outgoingNode)
            nodesMap.set(incomingNode.path, incomingNode)
            codeMapArrowService["map"] = nodesMap

            store.dispatch(setShowOutgoingEdges({ value: false }))
            store.dispatch(setShowIncomingEdges({ value: true }))
            store.dispatch(setEdgeMetric({ value: "dependencies" }))
            ;(edgesSelector as unknown as jest.Mock).mockReturnValue([
                { fromNodeName: outgoingNode.path, toNodeName: incomingNode.path, attributes: { dependencies: 2 } }
            ])

            codeMapArrowService["buildPairingEdges"](nodesMap)

            expect(codeMapArrowService.addArrow).toHaveBeenCalledTimes(1)
            expect(codeMapArrowService.addArrow).toHaveBeenCalledWith(outgoingNode, incomingNode, false)
        })

        it("should only add edges carrying the selected edge metric when multiple edge metrics exist", () => {
            // Arrange
            withMockedThreeSceneService()
            codeMapArrowService.addArrow = jest.fn()

            const outgoingNode: Node = OUTGOING_NODE
            const incomingNode: Node = INCOMING_NODE
            const differentNode: Node = DIFFERENT_NODE
            const nodesMap = new Map<string, Node>()
            nodesMap.set(outgoingNode.path, outgoingNode)
            nodesMap.set(incomingNode.path, incomingNode)
            nodesMap.set(differentNode.path, differentNode)
            codeMapArrowService["map"] = nodesMap

            store.dispatch(setShowOutgoingEdges({ value: true }))
            store.dispatch(setShowIncomingEdges({ value: false }))
            store.dispatch(setEdgeMetric({ value: "dependencies" }))
            ;(edgesSelector as unknown as jest.Mock).mockReturnValue([
                { fromNodeName: outgoingNode.path, toNodeName: incomingNode.path, attributes: { dependencies: 2 } },
                { fromNodeName: outgoingNode.path, toNodeName: differentNode.path, attributes: { temporal_coupling: 7 } }
            ])

            // Act
            codeMapArrowService["buildPairingEdges"](nodesMap)

            // Assert — the temporal_coupling-only edge contributes nothing to the dependencies count,
            // so it must not be drawn either
            expect(codeMapArrowService.addArrow).toHaveBeenCalledTimes(1)
            expect(codeMapArrowService.addArrow).toHaveBeenCalledWith(outgoingNode, incomingNode, true)
        })

        it("should not add any edges when no edge metric is selected", () => {
            // Arrange
            withMockedThreeSceneService()
            codeMapArrowService.addArrow = jest.fn()

            const outgoingNode: Node = OUTGOING_NODE
            const incomingNode: Node = INCOMING_NODE
            const nodesMap = new Map<string, Node>()
            nodesMap.set(outgoingNode.path, outgoingNode)
            nodesMap.set(incomingNode.path, incomingNode)
            codeMapArrowService["map"] = nodesMap

            store.dispatch(setShowOutgoingEdges({ value: true }))
            store.dispatch(setShowIncomingEdges({ value: true }))
            ;(edgesSelector as unknown as jest.Mock).mockReturnValue([
                { fromNodeName: outgoingNode.path, toNodeName: incomingNode.path, attributes: { dependencies: 2 } }
            ])

            // Act
            codeMapArrowService["buildPairingEdges"](nodesMap)

            // Assert
            expect(codeMapArrowService.addArrow).not.toHaveBeenCalled()
        })
    })

    describe("SelectionMethods", () => {
        beforeEach(() => {
            codeMapArrowService.clearArrows = jest.fn()
            codeMapArrowService.addArrow = jest.fn()
            codeMapArrowService["showEdgesOfBuildings"] = jest.fn()
            codeMapArrowService.addEdgePreview = jest.fn()
            threeSceneService.clearHighlight = jest.fn()
            codeMapArrowService["buildPairingEdges"] = jest.fn()
            codeMapArrowService.scale = jest.fn()
        })

        it("should call clearArrows and showEdgesOfBuildings through BuildingSelected", () => {
            codeMapArrowService.onBuildingSelected({ building: CODE_MAP_BUILDING })

            expect(codeMapArrowService.clearArrows).toHaveBeenCalled()
            expect(codeMapArrowService["showEdgesOfBuildings"]).toHaveBeenCalled()
            expect(codeMapArrowService.addEdgePreview).toHaveBeenCalledTimes(0)
        })

        it("should not call sub-methods through BuildingSelected if building is undefined", () => {
            codeMapArrowService.onBuildingSelected({ building: undefined })

            expect(codeMapArrowService.clearArrows).not.toHaveBeenCalled()
            expect(codeMapArrowService["showEdgesOfBuildings"]).not.toHaveBeenCalled()
            expect(codeMapArrowService.addEdgePreview).not.toHaveBeenCalled()
            expect(codeMapArrowService.scale).toHaveBeenCalled()
        })

        it("should call clearArrows and showEdgesOfBuildings through BuildingHovered", async () => {
            codeMapArrowService.onBuildingHovered(CODE_MAP_BUILDING)

            await wait(codeMapArrowService["HIGHLIGHT_BUILDING_DELAY"])

            expect(codeMapArrowService.clearArrows).toHaveBeenCalled()
            expect(codeMapArrowService["showEdgesOfBuildings"]).toHaveBeenCalled()
            expect(codeMapArrowService.addEdgePreview).toHaveBeenCalledTimes(0)
        })

        it("should clear arrows when hovering a flat building so previously shown edges do not linger", () => {
            // Arrange — a flat building is not edge-applicable; the previous building's arrows must still be cleared
            const flatBuilding = { node: { ...CODE_MAP_BUILDING.node, flat: true } } as CodeMapBuilding

            // Act
            codeMapArrowService["resetEdgesOfBuildings"](flatBuilding)

            // Assert — clear runs and the selected building's edges / preview are restored via showEdgesOfBuildings
            expect(codeMapArrowService.clearArrows).toHaveBeenCalled()
            expect(codeMapArrowService["showEdgesOfBuildings"]).toHaveBeenCalledWith(undefined)
        })

        it("should clear arrows when hovering an undefined building so previously shown edges do not linger", () => {
            // Arrange — a building hidden from the mesh resolves to undefined; arrows must still be cleared
            // Act
            codeMapArrowService["resetEdgesOfBuildings"](undefined)

            // Assert
            expect(codeMapArrowService.clearArrows).toHaveBeenCalled()
            expect(codeMapArrowService["showEdgesOfBuildings"]).toHaveBeenCalledWith(undefined)
        })

        it("should not clear arrows on hover when the edge metric is disabled", () => {
            // Arrange
            store.dispatch(toggleEdgeMetricVisible())

            // Act
            codeMapArrowService["resetEdgesOfBuildings"](CODE_MAP_BUILDING)

            // Assert
            expect(codeMapArrowService.clearArrows).not.toHaveBeenCalled()
            expect(codeMapArrowService["showEdgesOfBuildings"]).not.toHaveBeenCalled()
            expect(codeMapArrowService.scale).toHaveBeenCalled()
        })

        it("should call clearArrows and showEdgesOfBuildings through BuildingUnHovered when edge metric is enabled", () => {
            codeMapArrowService.onBuildingUnhovered()

            expect(codeMapArrowService.clearArrows).toHaveBeenCalled()
            expect(codeMapArrowService["showEdgesOfBuildings"]).toHaveBeenCalled()
            expect(codeMapArrowService.addEdgePreview).toHaveBeenCalledTimes(0)
        })

        it("should call clearArrows and showEdgesOfBuildings through BuildingUnHovered when edge metric is disabled", () => {
            store.dispatch(toggleEdgeMetricVisible())
            codeMapArrowService.onBuildingUnhovered()

            expect(codeMapArrowService.clearArrows).toHaveBeenCalledTimes(0)
            expect(codeMapArrowService["showEdgesOfBuildings"]).toHaveBeenCalledTimes(0)
            expect(codeMapArrowService.addEdgePreview).toHaveBeenCalledTimes(0)
        })

        it("should call clearArrows and showEdgesOfBuildings through BuildingDeselected", () => {
            codeMapArrowService.onBuildingDeselected()

            expect(codeMapArrowService.clearArrows).toHaveBeenCalled()
            expect(codeMapArrowService.addEdgePreview).toHaveBeenCalled()
            expect(codeMapArrowService.addArrow).toHaveBeenCalledTimes(0)
            expect(threeSceneService.clearHighlight).toHaveBeenCalledTimes(0)
            expect(codeMapArrowService["showEdgesOfBuildings"]).toHaveBeenCalledTimes(0)
        })

        it("should cancel a pending debounced edge reset when a building is unhovered", async () => {
            // Arrange — a hover schedules a debounced reset that would otherwise blank the restored preview
            const resetEdgesOfBuildingsMock = jest.fn()
            Object.defineProperty(codeMapArrowService, "resetEdgesOfBuildings", {
                value: resetEdgesOfBuildingsMock,
                writable: true,
                configurable: true
            })
            codeMapArrowService.onBuildingHovered(CODE_MAP_BUILDING)

            // Act
            codeMapArrowService.onBuildingUnhovered()
            await wait(codeMapArrowService["HIGHLIGHT_BUILDING_DELAY"] + 5)

            // Assert — the stale reset must not fire after the preview was restored
            expect(resetEdgesOfBuildingsMock).not.toHaveBeenCalled()
            expect(codeMapArrowService["showEdgesOfBuildings"]).toHaveBeenCalled()
        })

        it("should cancel a pending debounced edge reset when a building is deselected", async () => {
            // Arrange
            const resetEdgesOfBuildingsMock = jest.fn()
            Object.defineProperty(codeMapArrowService, "resetEdgesOfBuildings", {
                value: resetEdgesOfBuildingsMock,
                writable: true,
                configurable: true
            })
            codeMapArrowService.onBuildingHovered(CODE_MAP_BUILDING)

            // Act
            codeMapArrowService.onBuildingDeselected()
            await wait(codeMapArrowService["HIGHLIGHT_BUILDING_DELAY"] + 5)

            // Assert
            expect(resetEdgesOfBuildingsMock).not.toHaveBeenCalled()
            expect(codeMapArrowService.addEdgePreview).toHaveBeenCalled()
        })
    })

    describe("clearArrows", () => {
        beforeEach(() => {
            withMockedThreeSceneService()
        })

        it("should remove all array entries of field arrows", () => {
            setupEdgeArrowsWithChildren()

            codeMapArrowService.clearArrows()

            expect(codeMapArrowService["arrows"].length).toBe(0)
        })

        it("should remove all array entries of threeSceneService.edgeArrows.children", () => {
            setupEdgeArrowsWithChildren()

            codeMapArrowService.clearArrows()

            expect(threeSceneService.edgeArrows.children.length).toBe(0)
        })
    })

    describe("addEdgePreview", () => {
        beforeEach(() => {
            codeMapArrowService["map"] = new Map<string, Node>()
            codeMapArrowService["map"].get = jest.fn(() => {
                return INCOMING_NODE
            })
            codeMapArrowService["previewMode"] = jest.fn()
        })
        it("should create an edge Preview of one", () => {
            const nodes: Node[] = [OUTGOING_NODE]

            codeMapArrowService.addEdgeMapBasedOnNodes(nodes)

            expect(codeMapArrowService["map"].size).toEqual(1)
        })
        it("should not change stored edges for Preview", () => {
            codeMapArrowService.addEdgePreview()

            expect(codeMapArrowService["map"].size).toEqual(0)
        })
        it("when targetNode is invalid then it should not call preview mode", () => {
            const invalidEdge = clone(VALID_EDGES_DECORATED)
            invalidEdge[0].toNodeName = "invalid"
            ;(edgesSelector as unknown as jest.Mock).mockReturnValue(invalidEdge)
            const nodes: Node[] = [CODE_MAP_BUILDING_WITH_OUTGOING_EDGE_NODE.node]

            codeMapArrowService.addEdgeMapBasedOnNodes(nodes)
            codeMapArrowService.addEdgePreview()

            expect(codeMapArrowService["previewMode"]).not.toHaveBeenCalled()
        })
        it("when originNodeName is invalid then it should not call preview mode", () => {
            const invalidEdge = clone(VALID_EDGES_DECORATED)
            invalidEdge[0].fromNodeName = "invalid"
            ;(edgesSelector as unknown as jest.Mock).mockReturnValue(invalidEdge)
            const nodes: Node[] = [CODE_MAP_BUILDING_WITH_INCOMING_EDGE_NODE.node]

            codeMapArrowService.addEdgeMapBasedOnNodes(nodes)
            codeMapArrowService.addEdgePreview()

            expect(codeMapArrowService["previewMode"]).not.toHaveBeenCalled()
        })
    })

    describe("createCurve", () => {
        it("should create a curve out of the 2 Nodes", () => {
            const originNode: Node = OUTGOING_NODE
            const targetNode: Node = INCOMING_NODE
            const curveScale = 100 * state.getValue().mapState.edgeHeight

            const curve = codeMapArrowService["createCurve"](originNode, targetNode, curveScale)

            expect(curve).toBeDefined()
        })
    })

    describe("highlightBuilding", () => {
        it("should highlight certain buildings", () => {
            withMockedThreeSceneService()

            codeMapArrowService["highlightBuilding"](OUTGOING_NODE)

            expect(threeSceneService.getMapMesh().getMeshDescription().getBuildingByPath).toHaveBeenCalled()
            expect(threeSceneService.addBuildingsToHighlightingList).toHaveBeenCalled()
        })
    })

    describe("setCurveColor", () => {
        beforeEach(() => {
            threeSceneService.edgeArrows["add"] = jest.fn()
            codeMapArrowService["arrows"].push = jest.fn()
        })
        it("should run through the function with mocked subfunctions", () => {
            const originNode: Node = OUTGOING_NODE
            const targetNode: Node = INCOMING_NODE
            const curveScale = 100 * state.getValue().mapState.edgeHeight
            const curve = codeMapArrowService["createCurve"](originNode, targetNode, curveScale)
            const color = ColorConverter.convertHexToNumber(state.getValue().mapState.mapColors.outgoingEdge)

            codeMapArrowService["setCurveColor"](curve, color)

            expect(threeSceneService.edgeArrows["add"]).toHaveBeenCalled()
            expect(codeMapArrowService["arrows"].push).toHaveBeenCalled()
        })
    })

    describe("scale", () => {
        it("should set the scale of all arrows to x, y and z", () => {
            setupArrows()
            store.dispatch(setScaling({ value: new Vector3(1, 2, 3) }))

            codeMapArrowService.scale()

            expect(codeMapArrowService["arrows"][0].scale.x).toBe(1)
            expect(codeMapArrowService["arrows"][0].scale.y).toBe(2)
            expect(codeMapArrowService["arrows"][0].scale.z).toBe(3)
        })
    })
})
