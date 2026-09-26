import { TestBed } from "@angular/core/testing"
import { State, Store, StoreModule } from "@ngrx/store"
import { Vector3 } from "three"
import {
    TEST_LEAF_NODE_WITHOUT_EXTENSION,
    TEST_NODE_LEAF,
    TEST_NODE_LEAF_0_LENGTH,
    TEST_NODE_ROOT,
    TEST_NODES
} from "../../mocks/dataMocks"
import { CcState, LayoutAlgorithm } from "../../model/codeCharta.model"
import { setEnableFloorLabels, setLayoutAlgorithm, setScaling } from "../../stores/mapState/mapState.write.facade"
import { appReducers, setStateMiddleware } from "../../stores/rootStore/store"
import { selectedNodePathSelector } from "../../stores/sharedView/sharedView.read.facade"
import { keepHighlight, setSelectedNodePath } from "../../stores/sharedView/sharedView.write.facade"
import { FloorLabelDrawer } from "./floorLabels/floorLabelDrawer"
import { CODE_MAP_BUILDING, CODE_MAP_BUILDING_TS_NODE, CONSTANT_HIGHLIGHT } from "./rendering/codeMapBuilding.mocks"
import { CodeMapMesh } from "./rendering/codeMapMesh"
import { ThreeSceneService } from "./threeSceneService"

describe("ThreeSceneService", () => {
    let threeSceneService: ThreeSceneService
    let state: State<CcState>
    let store: Store<CcState>

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ThreeSceneService],
            imports: [StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]
        })

        state = TestBed.inject(State)
        store = TestBed.inject(Store)

        threeSceneService = TestBed.inject(ThreeSceneService)
        threeSceneService["mapMesh"] = new CodeMapMesh(TEST_NODES, state.getValue(), false)
        Object.defineProperty(threeSceneService, "constantHighlight", { value: CONSTANT_HIGHLIGHT, writable: true, configurable: true })
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

    describe("selection after the mesh was rebuilt", () => {
        const LEAF_PATH = "/root/big leaf"

        beforeEach(() => {
            // a layout without floor labels keeps the rebuild to the mesh this describe is about
            store.dispatch(setLayoutAlgorithm({ value: LayoutAlgorithm.StreetMap }))
        })

        function rebuildMeshWith(nodes = TEST_NODES) {
            threeSceneService.setMapMesh(nodes, new CodeMapMesh(nodes, state.getValue(), false))
        }

        function sceneSelectionPath() {
            return threeSceneService.getSelectedBuilding()?.node.path ?? null
        }

        it("should select what another view selected while the map was not drawn, and announce it", () => {
            // Arrange
            const selectedBuildings: string[] = []
            threeSceneService.subscribe("onBuildingSelected", ({ building }) => selectedBuildings.push(building.node.path))
            store.dispatch(setSelectedNodePath({ value: LEAF_PATH }))

            // Act
            rebuildMeshWith()

            // Assert
            expect(sceneSelectionPath()).toBe(LEAF_PATH)
            expect(selectedNodePathSelector(state.getValue())).toBe(LEAF_PATH)
            expect(selectedBuildings).toEqual([LEAF_PATH])
        })

        it("should drop the selection when the building it had selected is gone", () => {
            // Arrange
            store.dispatch(setSelectedNodePath({ value: LEAF_PATH }))
            rebuildMeshWith()

            // Act
            rebuildMeshWith([TEST_NODE_ROOT])

            // Assert
            expect(sceneSelectionPath()).toBeNull()
            expect(selectedNodePathSelector(state.getValue())).toBeNull()
        })

        it("should keep a selection the map draws no building for, such as a folder", () => {
            // Arrange
            store.dispatch(setSelectedNodePath({ value: "/root/a folder" }))

            // Act
            rebuildMeshWith()

            // Assert
            expect(sceneSelectionPath()).toBeNull()
            expect(selectedNodePathSelector(state.getValue())).toBe("/root/a folder")
        })
    })

    describe("clearSelection", () => {
        it("should clear a selection that no building was drawn for, so the inspector can be closed", () => {
            // Arrange: a node picked in the explorer selects it whether or not the map drew a building —
            // a folder, or a file with no area in the current metric, has none.
            threeSceneService["mapMesh"].clearSelection = jest.fn()
            store.dispatch(setSelectedNodePath({ value: "a-node-without-a-building" }))

            // Act
            threeSceneService.clearSelection()

            // Assert
            expect(selectedNodePathSelector(state.getValue())).toBeNull()
        })

        it("should leave the store alone when there was nothing selected at all", () => {
            // Arrange: clicking empty map space clears the selection on every click.
            threeSceneService["mapMesh"].clearSelection = jest.fn()
            const dispatch = jest.spyOn(store, "dispatch")

            // Act
            threeSceneService.clearSelection()

            // Assert
            expect(dispatch).not.toHaveBeenCalled()
        })
    })

    describe("selectBuilding", () => {
        beforeEach(() => {
            threeSceneService["threeRendererService"].render = jest.fn()
            threeSceneService["mapMesh"].selectBuilding = jest.fn()
            threeSceneService["mapMesh"].clearSelection = jest.fn()
            threeSceneService["mapMesh"].highlightBuilding = jest.fn()
        })

        it("should clear the previously selected building before selecting a different one", () => {
            // Arrange
            threeSceneService.selectBuilding(CODE_MAP_BUILDING)
            ;(threeSceneService["mapMesh"].clearSelection as jest.Mock).mockClear()

            // Act
            threeSceneService.selectBuilding(CODE_MAP_BUILDING_TS_NODE)

            // Assert
            expect(threeSceneService["mapMesh"].clearSelection).toHaveBeenCalledWith(CODE_MAP_BUILDING)
            expect(threeSceneService["selected"]).toBe(CODE_MAP_BUILDING_TS_NODE)
        })

        it("should not clear selection when the same building is selected again", () => {
            // Arrange
            threeSceneService.selectBuilding(CODE_MAP_BUILDING)
            ;(threeSceneService["mapMesh"].clearSelection as jest.Mock).mockClear()

            // Act
            threeSceneService.selectBuilding(CODE_MAP_BUILDING)

            // Assert
            expect(threeSceneService["mapMesh"].clearSelection).not.toHaveBeenCalled()
        })
    })

    describe("addBuildingsToHighlightingList", () => {
        it("should add the given building to the HighlightingList ", () => {
            threeSceneService["highlightedBuildingIds"].clear()
            threeSceneService["highlightedNodeIds"].clear()
            threeSceneService["primaryHighlightedBuilding"] = null

            threeSceneService.addBuildingsToHighlightingList(CODE_MAP_BUILDING)

            expect(threeSceneService["highlightedBuildingIds"].has(CODE_MAP_BUILDING.id)).toBe(true)
            expect(threeSceneService["primaryHighlightedBuilding"]).toBe(CODE_MAP_BUILDING)
        })
    })

    describe("showKeptHighlight", () => {
        const LEAF_PATH = "/root/big leaf"

        beforeEach(() => {
            Object.defineProperty(threeSceneService, "constantHighlight", { value: new Map(), writable: true, configurable: true })
            threeSceneService["threeRendererService"].render = jest.fn()
        })

        it("should light the buildings of the kept paths and repaint", () => {
            // Arrange
            jest.spyOn(threeSceneService, "applyHighlights")

            // Act
            threeSceneService.showKeptHighlight([LEAF_PATH, "/root/not drawn"])

            // Assert
            expect([...threeSceneService.getConstantHighlight().values()].map(({ node }) => node.path)).toEqual([LEAF_PATH])
            expect(threeSceneService.applyHighlights).toHaveBeenCalled()
        })

        it("should repaint the default colours once nothing is kept any more", () => {
            // Arrange
            threeSceneService.showKeptHighlight([LEAF_PATH])
            jest.spyOn(threeSceneService["mapMesh"], "clearUnselectedBuildings")
            jest.spyOn(threeSceneService, "applyHighlights")

            // Act
            threeSceneService.showKeptHighlight([])

            // Assert
            expect(threeSceneService.getConstantHighlight().size).toBe(0)
            expect(threeSceneService["mapMesh"].clearUnselectedBuildings).toHaveBeenCalled()
            expect(threeSceneService.applyHighlights).not.toHaveBeenCalled()
            expect(threeSceneService["threeRendererService"].render).toHaveBeenCalled()
        })

        it("should keep the hovered building lit once nothing is kept any more", () => {
            // Arrange
            const hoveredBuilding = threeSceneService["mapMesh"].getBuildingByPath("/root")
            threeSceneService.showKeptHighlight([LEAF_PATH])
            threeSceneService.addBuildingsToHighlightingList(hoveredBuilding)
            jest.spyOn(threeSceneService, "applyHighlights")

            // Act
            threeSceneService.showKeptHighlight([])

            // Assert
            expect(threeSceneService["highlightedBuildingIds"]).toEqual(new Set([hoveredBuilding.id]))
            expect(threeSceneService.applyHighlights).toHaveBeenCalled()
        })

        it("should not repaint while nothing was or is kept", () => {
            // Arrange
            jest.spyOn(threeSceneService, "applyHighlights")

            // Act
            threeSceneService.showKeptHighlight([])

            // Assert
            expect(threeSceneService.applyHighlights).not.toHaveBeenCalled()
            expect(threeSceneService["threeRendererService"].render).not.toHaveBeenCalled()
        })

        it("should find the kept buildings again on a rebuilt mesh", () => {
            // Arrange
            store.dispatch(setLayoutAlgorithm({ value: LayoutAlgorithm.StreetMap }))
            store.dispatch(keepHighlight({ paths: [LEAF_PATH] }))
            const rebuiltMesh = new CodeMapMesh(TEST_NODES, state.getValue(), false)

            // Act
            threeSceneService.setMapMesh(TEST_NODES, rebuiltMesh)

            // Assert
            expect([...threeSceneService.getConstantHighlight().values()]).toEqual([rebuiltMesh.getBuildingByPath(LEAF_PATH)])
        })

        it("should paint the kept highlight on a rebuilt mesh", () => {
            // Arrange
            store.dispatch(setLayoutAlgorithm({ value: LayoutAlgorithm.StreetMap }))
            store.dispatch(keepHighlight({ paths: [LEAF_PATH] }))
            const rebuiltMesh = new CodeMapMesh(TEST_NODES, state.getValue(), false)
            jest.spyOn(threeSceneService, "applyHighlights")

            // Act
            threeSceneService.setMapMesh(TEST_NODES, rebuiltMesh)

            // Assert
            expect(threeSceneService.applyHighlights).toHaveBeenCalled()
        })

        it("should paint the kept highlight on a mesh updated in place", () => {
            // Arrange
            store.dispatch(setLayoutAlgorithm({ value: LayoutAlgorithm.StreetMap }))
            store.dispatch(keepHighlight({ paths: [LEAF_PATH] }))
            jest.spyOn(threeSceneService, "applyHighlights")

            // Act
            threeSceneService.updateMapMeshInPlace(TEST_NODES, TEST_NODES, state.getValue(), false)

            // Assert
            expect(threeSceneService.getConstantHighlight().size).toBe(1)
            expect(threeSceneService.applyHighlights).toHaveBeenCalled()
        })

        it("should leave a rebuilt mesh undimmed while nothing is kept", () => {
            // Arrange
            store.dispatch(setLayoutAlgorithm({ value: LayoutAlgorithm.StreetMap }))
            const rebuiltMesh = new CodeMapMesh(TEST_NODES, state.getValue(), false)
            jest.spyOn(threeSceneService, "applyHighlights")

            // Act
            threeSceneService.setMapMesh(TEST_NODES, rebuiltMesh)

            // Assert
            expect(threeSceneService.applyHighlights).not.toHaveBeenCalled()
        })
    })

    describe("highlightSingleBuilding", () => {
        it("should add a building to the highlighting list and call the highlight function", () => {
            threeSceneService.addBuildingsToHighlightingList = jest.fn()
            threeSceneService.applyHighlights = jest.fn()
            threeSceneService["highlightedBuildingIds"].clear()
            threeSceneService["highlightedNodeIds"].clear()
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
        it("should keep the kept highlight while it clears the hover highlight", () => {
            // Arrange
            const keptHighlight = new Map([[CODE_MAP_BUILDING.id, CODE_MAP_BUILDING]])
            Object.defineProperty(threeSceneService, "constantHighlight", { value: keptHighlight, writable: true, configurable: true })
            threeSceneService["threeRendererService"].render = jest.fn()
            threeSceneService.addBuildingsToHighlightingList(CODE_MAP_BUILDING_TS_NODE)

            // Act
            threeSceneService.applyClearHighlights()

            // Assert
            expect(threeSceneService["highlightedBuildingIds"].size).toBe(0)
            expect([...threeSceneService.getConstantHighlight().values()]).toEqual([CODE_MAP_BUILDING])
        })

        it("should call clearHighlight and render changes", () => {
            // Arrange
            Object.defineProperty(threeSceneService, "constantHighlight", { value: new Map(), writable: true, configurable: true })
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
            Object.defineProperty(threeSceneService, "floorLabelDrawer", {
                value: { translatePlaneCanvases: translateCanvasesMock },
                writable: true
            })

            const scaling = new Vector3(1, 2, 3)
            store.dispatch(setScaling({ value: scaling }))

            threeSceneService.scaleHeight()

            const mapGeometry = threeSceneService.mapGeometry

            expect(mapGeometry.scale).toEqual(scaling)
            expect(translateCanvasesMock).toHaveBeenCalledTimes(1)
        })

        it("should call mapMesh.scale and apply the correct scaling to the mesh", () => {
            const translateCanvasesMock = jest.fn()
            Object.defineProperty(threeSceneService, "floorLabelDrawer", {
                value: { translatePlaneCanvases: translateCanvasesMock },
                writable: true
            })

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

        it("should highlight nothing, without failing, before any 3D map was built", () => {
            // Arrange
            threeSceneService["mapMesh"] = undefined

            // Act
            const highlight = () => {
                threeSceneService.highlightBuildingsByExtension(new Set<string>(["ts"]))
                threeSceneService.highlightBuildingsWithoutExtensions()
            }

            // Assert
            expect(highlight).not.toThrow()
            expect(threeSceneService["highlightedBuildingIds"].size).toBe(0)
        })
    })
})
