import { State, Store, StoreModule } from "@ngrx/store"
import {
    CODE_MAP_BUILDING,
    CODE_MAP_BUILDING_TS_NODE,
    CONSTANT_HIGHLIGHT,
    TEST_LEAF_NODE_WITHOUT_EXTENSION,
    TEST_NODE_LEAF,
    TEST_NODE_LEAF_0_LENGTH,
    TEST_NODES,
    VALID_FILE_NODE_WITH_ID,
    VALID_NODES_WITH_ID
} from "../../../util/dataMocks"
import { CodeMapBuilding } from "../rendering/codeMapBuilding"
import { ThreeSceneService } from "./threeSceneService"
import { CodeMapMesh } from "../rendering/codeMapMesh"
import { CcState, CodeMapNode, LayoutAlgorithm } from "../../../codeCharta.model"
import { setScaling } from "../../../state/store/appSettings/scaling/scaling.actions"
import { Vector3 } from "three"
import { setLayoutAlgorithm } from "../../../state/store/appSettings/layoutAlgorithm/layoutAlgorithm.actions"
import { FloorLabelDrawer } from "./floorLabels/floorLabelDrawer"
import { idToNodeSelector } from "../../../state/selectors/accumulatedData/idToNode.selector"
import { TestBed } from "@angular/core/testing"
import { IdToBuildingService } from "../../../services/idToBuilding/idToBuilding.service"
import { setEnableFloorLabels } from "../../../state/store/appSettings/enableFloorLabels/enableFloorLabels.actions"
import { appReducers, setStateMiddleware } from "../../../state/store/state.manager"

jest.mock("../../../state/selectors/accumulatedData/idToNode.selector", () => ({
    idToNodeSelector: jest.fn()
}))
const mockedIdToNodeSelector = jest.mocked(idToNodeSelector)

describe("ThreeSceneService", () => {
    let threeSceneService: ThreeSceneService
    let state: State<CcState>
    let idToBuildingService: IdToBuildingService
    let store: Store<CcState>

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ThreeSceneService],
            imports: [StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]
        })

        state = TestBed.inject(State)
        idToBuildingService = TestBed.inject(IdToBuildingService)
        store = TestBed.inject(Store)

        threeSceneService = TestBed.inject(ThreeSceneService)
        threeSceneService["mapMesh"] = new CodeMapMesh(TEST_NODES, state.getValue(), false)
        threeSceneService["constantHighlight"] = CONSTANT_HIGHLIGHT
    })

    describe("highlightBuildings", () => {
        it("should call highlightBuilding", () => {
            threeSceneService["mapMesh"].highlightBuilding = jest.fn()
            threeSceneService["threeRendererService"].render = jest.fn()

            threeSceneService.applyHighlights()

            expect(threeSceneService["mapMesh"].highlightBuilding).toHaveBeenCalledWith(
                threeSceneService["highlightedBuildingIds"],
                threeSceneService["primaryHighlightedBuilding"],
                null,
                state.getValue(),
                threeSceneService["constantHighlight"]
            )
            expect(threeSceneService["threeRendererService"].render).toHaveBeenCalled()
        })
    })

    describe("addBuildingsToHighlightingList", () => {
        it("should add the given building to the HighlightingList ", () => {
            threeSceneService["highlightedBuildingIds"] = new Set()
            threeSceneService["highlightedNodeIds"] = new Set()
            threeSceneService["primaryHighlightedBuilding"] = null

            threeSceneService.addBuildingsToHighlightingList(CODE_MAP_BUILDING)

            expect(threeSceneService["highlightedBuildingIds"].has(CODE_MAP_BUILDING.id)).toBe(true)
            expect(threeSceneService["primaryHighlightedBuilding"]).toBe(CODE_MAP_BUILDING)
        })
    })

    describe("addNodeAndChildrenToConstantHighlight", () => {
        beforeEach(() => {
            mockedIdToNodeSelector.mockImplementation(() => {
                const idToNode = new Map<number, CodeMapNode>()
                idToNode.set(VALID_NODES_WITH_ID.id, VALID_NODES_WITH_ID)
                idToNode.set(VALID_FILE_NODE_WITH_ID.id, VALID_FILE_NODE_WITH_ID)
                return idToNode
            })
            idToBuildingService.setIdToBuilding([CODE_MAP_BUILDING, CODE_MAP_BUILDING_TS_NODE])
            threeSceneService["constantHighlight"] = new Map()
        })

        it("should add a node into constant highlight ", () => {
            const result = new Map<number, CodeMapBuilding>()
            result.set(CODE_MAP_BUILDING_TS_NODE.id, CODE_MAP_BUILDING_TS_NODE)

            threeSceneService.addNodeAndChildrenToConstantHighlight(VALID_FILE_NODE_WITH_ID)

            expect(threeSceneService["constantHighlight"]).toEqual(result)
        })

        it("should add the folder and its children into constant highlight", () => {
            const result = new Map<number, CodeMapBuilding>()
            result.set(CODE_MAP_BUILDING.id, CODE_MAP_BUILDING)
            result.set(CODE_MAP_BUILDING_TS_NODE.id, CODE_MAP_BUILDING_TS_NODE)

            threeSceneService.addNodeAndChildrenToConstantHighlight(VALID_NODES_WITH_ID)

            expect(threeSceneService["constantHighlight"]).toEqual(result)
        })
    })

    describe("removeNodeAndChildrenFromConstantHighlight", () => {
        beforeEach(() => {
            mockedIdToNodeSelector.mockImplementation(() => {
                const idToNode = new Map<number, CodeMapNode>()
                idToNode.set(VALID_NODES_WITH_ID.id, VALID_NODES_WITH_ID)
                idToNode.set(VALID_FILE_NODE_WITH_ID.id, VALID_FILE_NODE_WITH_ID)
                return idToNode
            })
            idToBuildingService.setIdToBuilding([CODE_MAP_BUILDING, CODE_MAP_BUILDING_TS_NODE])
        })

        it("should remove the building from constant Highlight ", () => {
            const result = new Map<number, CodeMapBuilding>()
            result.set(CODE_MAP_BUILDING.id, CODE_MAP_BUILDING)

            threeSceneService.removeNodeAndChildrenFromConstantHighlight(VALID_FILE_NODE_WITH_ID)

            expect(threeSceneService["constantHighlight"]).toEqual(result)
        })

        it("should remove the folder and its children from constant Highlight ", () => {
            const result = new Map()

            threeSceneService.removeNodeAndChildrenFromConstantHighlight(VALID_NODES_WITH_ID)

            expect(threeSceneService["constantHighlight"]).toEqual(result)
        })
    })

    describe("clearConstantHighlight", () => {
        it("should clear all the constant highlighted buildings ", () => {
            threeSceneService["constantHighlight"].set(CODE_MAP_BUILDING.id, CODE_MAP_BUILDING)

            threeSceneService.clearConstantHighlight()

            expect(threeSceneService["constantHighlight"].size).toEqual(0)
        })
    })

    describe("highlightSingleBuilding", () => {
        it("should add a building to the highlighting list and call the highlight function", () => {
            threeSceneService.addBuildingsToHighlightingList = jest.fn()
            threeSceneService.applyHighlights = jest.fn()
            threeSceneService["highlightedBuildingIds"] = new Set()
            threeSceneService["highlightedNodeIds"] = new Set()
            threeSceneService["primaryHighlightedBuilding"] = null

            threeSceneService.highlightSingleBuilding(CODE_MAP_BUILDING)

            expect(threeSceneService.addBuildingsToHighlightingList).toHaveBeenCalled()
            expect(threeSceneService.applyHighlights).toHaveBeenCalled()
        })
    })

    describe("prepareHighlightTransition", () => {
        it("should clear IDs and primary building without touching mesh colors", () => {
            // Arrange
            threeSceneService.addBuildingsToHighlightingList(CODE_MAP_BUILDING)

            // Act
            threeSceneService.prepareHighlightTransition()

            // Assert
            expect(threeSceneService["highlightedBuildingIds"].size).toBe(0)
            expect(threeSceneService["highlightedNodeIds"].size).toBe(0)
            expect(threeSceneService["primaryHighlightedBuilding"]).toBeNull()
        })
    })

    describe("clearHighlight", () => {
        it("should clear the highlighting list", () => {
            threeSceneService.clearHighlight()

            expect(threeSceneService["highlightedBuildingIds"].size).toBe(0)
            expect(threeSceneService["primaryHighlightedBuilding"]).toBeNull()
        })
    })

    describe("applyClearHighlights", () => {
        it("should call clearHighlight and render changes", () => {
            // Arrange
            const renderSpy = jest.spyOn(threeSceneService["threeRendererService"], "render").mockImplementation(() => {})

            // Act
            threeSceneService.applyClearHighlights()

            // Assert
            expect(renderSpy).toHaveBeenCalled()
        })
    })

    describe("scaleHeight", () => {
        it("should update mapGeometry scaling to new vector", () => {
            const translateCanvasesMock = jest.fn()
            threeSceneService["floorLabelDrawer"] = {
                translatePlaneCanvases: translateCanvasesMock
            }

            const scaling = new Vector3(1, 2, 3)
            store.dispatch(setScaling({ value: scaling }))

            threeSceneService.scaleHeight()

            const mapGeometry = threeSceneService.mapGeometry

            expect(mapGeometry.scale).toEqual(scaling)
            expect(translateCanvasesMock).toHaveBeenCalledTimes(1)
        })

        it("should call mapMesh.scale and apply the correct scaling to the mesh", () => {
            const translateCanvasesMock = jest.fn()
            threeSceneService["floorLabelDrawer"] = {
                translatePlaneCanvases: translateCanvasesMock
            }

            const scaling = new Vector3(1, 2, 3)
            store.dispatch(setScaling({ value: scaling }))
            threeSceneService["mapMesh"].setScale = jest.fn()

            threeSceneService.scaleHeight()

            expect(threeSceneService["mapMesh"].setScale).toHaveBeenCalledWith(scaling)
            expect(translateCanvasesMock).toHaveBeenCalledTimes(1)
        })
    })

    describe("initFloorLabels", () => {
        const floorLabelDrawerSpy = jest.spyOn(FloorLabelDrawer.prototype, "draw").mockReturnValue([])

        afterEach(() => {
            floorLabelDrawerSpy.mockReset()
        })

        it("should not add floor labels for StreetMap and TreeMapStreet algorithms", () => {
            threeSceneService["notifyMapMeshChanged"] = jest.fn()
            const getRootNodeMock = jest.fn()
            const originalGetRootNode = threeSceneService["getRootNode"]
            threeSceneService["getRootNode"] = getRootNodeMock

            store.dispatch(setLayoutAlgorithm({ value: LayoutAlgorithm.StreetMap }))
            threeSceneService.setMapMesh([], new CodeMapMesh(TEST_NODES, state.getValue(), false))

            store.dispatch(setLayoutAlgorithm({ value: LayoutAlgorithm.TreeMapStreet }))
            threeSceneService.setMapMesh([], new CodeMapMesh(TEST_NODES, state.getValue(), false))

            expect(getRootNodeMock).not.toHaveBeenCalled()
            expect(floorLabelDrawerSpy).not.toHaveBeenCalled()

            threeSceneService["getRootNode"] = originalGetRootNode

            store.dispatch(setLayoutAlgorithm({ value: LayoutAlgorithm.SquarifiedTreeMap }))
            threeSceneService.setMapMesh(TEST_NODES, new CodeMapMesh(TEST_NODES, state.getValue(), false))

            expect(floorLabelDrawerSpy).toHaveBeenCalled()
        })

        it("should not add floor labels if no root node was found", () => {
            threeSceneService["notifyMapMeshChanged"] = jest.fn()
            const floorLabelDrawerSpy = jest.spyOn(FloorLabelDrawer.prototype, "draw").mockReturnValue([])

            store.dispatch(setLayoutAlgorithm({ value: LayoutAlgorithm.SquarifiedTreeMap }))
            threeSceneService.setMapMesh([TEST_NODE_LEAF], new CodeMapMesh(TEST_NODES, state.getValue(), false))

            expect(floorLabelDrawerSpy).not.toHaveBeenCalled()
        })

        it("should not add floor labels if floor labels are disabled", () => {
            threeSceneService["notifyMapMeshChanged"] = jest.fn()
            const floorLabelDrawerSpy = jest.spyOn(FloorLabelDrawer.prototype, "draw").mockReturnValue([])

            store.dispatch(setEnableFloorLabels({ value: false }))
            threeSceneService.setMapMesh([TEST_NODE_LEAF], new CodeMapMesh(TEST_NODES, state.getValue(), false))

            expect(floorLabelDrawerSpy).not.toHaveBeenCalled()
        })
    })

    describe("Highlighting by extensioins", () => {
        beforeEach(() => {
            threeSceneService["mapMesh"] = new CodeMapMesh(
                [TEST_NODE_LEAF, TEST_NODE_LEAF_0_LENGTH, TEST_LEAF_NODE_WITHOUT_EXTENSION],
                state.getValue(),
                false
            )
        })

        it("WHEN highlighting buildings without extensions then only files without extensions are highlighted", () => {
            threeSceneService.highlightBuildingsWithoutExtensions()
            const buildings = threeSceneService["mapMesh"].getMeshDescription().buildings
            const fileNames = buildings.filter(b => threeSceneService["highlightedBuildingIds"].has(b.id)).map(b => b.node.name)
            expect(fileNames).toEqual([TEST_LEAF_NODE_WITHOUT_EXTENSION.name])
        })

        it("WHEN highlighting buildings with extensions then only files without extensions are highlighted", () => {
            threeSceneService.highlightBuildingsByExtension(new Set<string>(["ts"]))
            const buildings = threeSceneService["mapMesh"].getMeshDescription().buildings
            const fileNames = buildings.filter(b => threeSceneService["highlightedBuildingIds"].has(b.id)).map(b => b.node.name)
            expect(fileNames).toEqual([TEST_NODE_LEAF.name, TEST_NODE_LEAF_0_LENGTH.name])
        })
    })
})
