import { TestBed } from "@angular/core/testing"
import { StoreModule, Store, State } from "@ngrx/store"
import { CodeMapArrowService } from "./codeMap.arrow.service"
import { ThreeSceneService } from "../threeViewer/threeSceneService"
import { Object3D, Vector3 } from "three"
import {
    CODE_MAP_BUILDING,
    OUTGOING_NODE,
    DIFFERENT_NODE,
    INCOMING_NODE,
    VALID_EDGES_DECORATED,
    CODE_MAP_BUILDING_WITH_INCOMING_EDGE_NODE,
    CODE_MAP_BUILDING_WITH_OUTGOING_EDGE_NODE
} from "../../../util/dataMocks"
import { CcState, Node } from "../../../codeCharta.model"
import { ColorConverter } from "../../../util/color/colorConverter"
import { setScaling } from "../../../state/store/appSettings/scaling/scaling.actions"
import { setEdges } from "../../../state/store/fileSettings/edges/edges.actions"
import { setHeightMetric } from "../../../state/store/dynamicSettings/heightMetric/heightMetric.actions"
import { CodeMapMesh } from "../rendering/codeMapMesh"
import { toggleEdgeMetricVisible } from "../../../state/store/appSettings/isEdgeMetricVisible/isEdgeMetricVisible.actions"
import { wait } from "../../../util/testUtils/wait"
import { IdToBuildingService } from "../../../services/idToBuilding/idToBuilding.service"
import { appReducers, setStateMiddleware } from "../../../state/store/state.manager"
import { clone } from "../../../util/clone"
import { setShowOutgoingEdges } from "../../../state/store/appSettings/showEdges/outgoing/showOutgoingEdges.actions"
import { setShowIncomingEdges } from "../../../state/store/appSettings/showEdges/incoming/showIncomingEdges.actions"

describe("CodeMapArrowService", () => {
    let codeMapArrowService: CodeMapArrowService
    let threeSceneService: ThreeSceneService
    let store: Store<CcState>
    let state: State<CcState>
    let idToBuildingService: IdToBuildingService

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]
        })
        threeSceneService = TestBed.inject(ThreeSceneService)
        store = TestBed.inject(Store)
        state = TestBed.inject(State)
        idToBuildingService = TestBed.inject(IdToBuildingService)
        codeMapArrowService = new CodeMapArrowService(store, state, threeSceneService, idToBuildingService)
    })

    function withMockedThreeSceneService() {
        threeSceneService = codeMapArrowService["threeSceneService"] = jest.fn().mockReturnValue({
            edgeArrows: {
                children: [],
                add: jest.fn()
            },
            highlightedBuildings: [],
            getMapMesh: jest.fn().mockReturnValue({
                getMeshDescription: jest.fn().mockReturnValue({ getBuildingByPath: jest.fn() }),
                clearHighlight: jest.fn(),
                highlightBuilding: jest.fn(),
                clearSelection: jest.fn(),
                selectBuilding: jest.fn()
            }),
            highlightBuildings: jest.fn(),
            addBuildingToHighlightingList: jest.fn(),
            getSelectedBuilding: jest.fn().mockReturnValue({
                value: "value"
            })
        })()
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

    describe("Arrow Behaviour when selecting and hovering a building", () => {
        it("should only highlight small leaf when big leaf is selected", async () => {
            store.dispatch(setEdges({ value: VALID_EDGES_DECORATED }))
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
            codeMapArrowService["resetEdgesOfBuildings"] = resetEdgesOfBuildingMock
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
            store.dispatch(setEdges({ value: [{ fromNodeName: outgoingNode.path, toNodeName: incomingNode.path, attributes: {} }] }))

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
            store.dispatch(setEdges({ value: [{ fromNodeName: outgoingNode.path, toNodeName: incomingNode.path, attributes: {} }] }))

            codeMapArrowService["buildPairingEdges"](nodesMap)

            expect(codeMapArrowService.addArrow).toHaveBeenCalledTimes(1)
            expect(codeMapArrowService.addArrow).toHaveBeenCalledWith(outgoingNode, incomingNode, false)
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
            store.dispatch(setEdges({ value: invalidEdge }))
            const nodes: Node[] = [CODE_MAP_BUILDING_WITH_OUTGOING_EDGE_NODE.node]

            codeMapArrowService.addEdgeMapBasedOnNodes(nodes)
            codeMapArrowService.addEdgePreview()

            expect(codeMapArrowService["previewMode"]).not.toHaveBeenCalled()
        })
        it("when originNodeName is invalid then it should not call preview mode", () => {
            const invalidEdge = clone(VALID_EDGES_DECORATED)
            invalidEdge[0].fromNodeName = "invalid"
            store.dispatch(setEdges({ value: invalidEdge }))
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
            const curveScale = 100 * state.getValue().appSettings.edgeHeight

            const curve = codeMapArrowService["createCurve"](originNode, targetNode, curveScale)

            expect(curve).toBeDefined()
        })
    })

    describe("highlightBuilding", () => {
        it("should highlight certain buildings", () => {
            withMockedThreeSceneService()

            codeMapArrowService["highlightBuilding"](OUTGOING_NODE)

            expect(threeSceneService.getMapMesh().getMeshDescription().getBuildingByPath).toHaveBeenCalled()
            expect(threeSceneService.addBuildingToHighlightingList).toHaveBeenCalled()
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
            const curveScale = 100 * state.getValue().appSettings.edgeHeight
            const curve = codeMapArrowService["createCurve"](originNode, targetNode, curveScale)
            const color = ColorConverter.convertHexToNumber(state.getValue().appSettings.mapColors.outgoingEdge)

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
