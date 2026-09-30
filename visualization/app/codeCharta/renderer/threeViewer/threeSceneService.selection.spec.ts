import { TestBed } from "@angular/core/testing"
import { State, Store, StoreModule } from "@ngrx/store"
import { TEST_NODE_ROOT, TEST_NODES } from "../../mocks/dataMocks"
import { CcState, LayoutAlgorithm } from "../../model/codeCharta.model"
import { setLayoutAlgorithm } from "../../stores/mapState/mapState.write.facade"
import { appReducers, setStateMiddleware } from "../../stores/rootStore/store"
import { selectedNodePathSelector } from "../../stores/sharedView/sharedView.read.facade"
import { setSelectedNodePath } from "../../stores/sharedView/sharedView.write.facade"
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
        Object.defineProperty(sceneHighlight(), "constantHighlight", { value: CONSTANT_HIGHLIGHT, writable: true, configurable: true })
    })

    function sceneHighlight() {
        return threeSceneService["highlight"]
    }

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

        it("should clear the selection colour of what another view deselected while the map was not drawn", () => {
            // Arrange
            store.dispatch(setSelectedNodePath({ value: LEAF_PATH }))
            rebuildMeshWith()
            store.dispatch(setSelectedNodePath({ value: "/root" }))
            const rebuiltMesh = new CodeMapMesh(TEST_NODES, state.getValue(), false)
            jest.spyOn(rebuiltMesh, "clearSelection")

            // Act
            threeSceneService.setMapMesh(TEST_NODES, rebuiltMesh)

            // Assert
            expect(rebuiltMesh.clearSelection).toHaveBeenCalledWith(rebuiltMesh.getBuildingByPath(LEAF_PATH))
            expect(sceneSelectionPath()).toBe("/root")
        })
    })

    describe("showSelection", () => {
        const LEAF_PATH = "/root/big leaf"

        it("should show a selection another view made without writing it back to the store", () => {
            // Arrange
            const dispatch = jest.spyOn(store, "dispatch")

            // Act
            threeSceneService.showSelection(LEAF_PATH)

            // Assert
            expect(threeSceneService.getSelectedBuilding().node.path).toBe(LEAF_PATH)
            expect(dispatch).not.toHaveBeenCalled()
        })

        it("should deselect and announce it when the other view selected nothing the map draws", () => {
            // Arrange
            const onBuildingDeselected = jest.fn()
            threeSceneService.subscribe("onBuildingDeselected", onBuildingDeselected)
            threeSceneService.showSelection(LEAF_PATH)

            // Act
            threeSceneService.showSelection(null)

            // Assert
            expect(threeSceneService.getSelectedBuilding()).toBeNull()
            expect(onBuildingDeselected).toHaveBeenCalledTimes(1)
        })

        it("should not repaint a selection the scene already shows", () => {
            // Arrange
            threeSceneService.showSelection(LEAF_PATH)
            jest.spyOn(threeSceneService["mapMesh"], "selectBuilding")

            // Act
            threeSceneService.showSelection(LEAF_PATH)

            // Assert
            expect(threeSceneService["mapMesh"].selectBuilding).not.toHaveBeenCalled()
        })

        it("should neither select nor announce anything before any 3D map was built", () => {
            // Arrange
            const onBuildingDeselected = jest.fn()
            threeSceneService.subscribe("onBuildingDeselected", onBuildingDeselected)
            threeSceneService["mapMesh"] = undefined

            // Act
            threeSceneService.showSelection(null)

            // Assert
            expect(threeSceneService.getSelectedBuilding()).toBeNull()
            expect(onBuildingDeselected).not.toHaveBeenCalled()
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

        it("should clear a selected building and repaint the hover highlight without it", () => {
            // Arrange
            threeSceneService["threeRendererService"].render = jest.fn()
            threeSceneService.selectBuilding(threeSceneService["mapMesh"].getBuildingByPath("/root/big leaf"))
            threeSceneService.addBuildingsToHighlightingList(threeSceneService["mapMesh"].getBuildingByPath("/root"))
            jest.spyOn(threeSceneService["mapMesh"], "clearSelection")
            jest.spyOn(sceneHighlight(), "apply")

            // Act
            threeSceneService.clearSelection()

            // Assert
            expect(threeSceneService["mapMesh"].clearSelection).toHaveBeenCalled()
            expect(sceneHighlight().apply).toHaveBeenCalled()
            expect(threeSceneService.getSelectedBuilding()).toBeNull()
            expect(selectedNodePathSelector(state.getValue())).toBeNull()
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

        it("should select nothing when no building is given", () => {
            // Act
            threeSceneService.selectBuilding(null)

            // Assert
            expect(threeSceneService.getSelectedBuilding()).toBeNull()
            expect(threeSceneService["mapMesh"].selectBuilding).not.toHaveBeenCalled()
        })
    })

    describe("recolorMapMesh", () => {
        it("should recolor the buildings and repaint the selection and highlight on top", () => {
            // Arrange
            threeSceneService["threeRendererService"].render = jest.fn()
            const selectedBuilding = threeSceneService["mapMesh"].getBuildingByPath("/root/big leaf")
            threeSceneService.selectBuilding(selectedBuilding)
            jest.spyOn(threeSceneService["mapMesh"], "recolorBuildings")
            jest.spyOn(threeSceneService["mapMesh"], "selectBuilding")
            jest.spyOn(sceneHighlight(), "apply")

            // Act
            threeSceneService.recolorMapMesh(state.getValue())

            // Assert
            expect(threeSceneService["mapMesh"].recolorBuildings).toHaveBeenCalled()
            expect(threeSceneService["mapMesh"].selectBuilding).toHaveBeenCalledWith(selectedBuilding, expect.any(String))
            expect(sceneHighlight().apply).toHaveBeenCalled()
        })

        it("should do nothing before any 3D map was built", () => {
            // Arrange
            threeSceneService["mapMesh"] = undefined
            jest.spyOn(sceneHighlight(), "apply")

            // Act
            threeSceneService.recolorMapMesh(state.getValue())

            // Assert
            expect(sceneHighlight().apply).not.toHaveBeenCalled()
        })
    })
})
