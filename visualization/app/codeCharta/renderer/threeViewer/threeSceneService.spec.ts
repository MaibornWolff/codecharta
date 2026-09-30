import { TestBed } from "@angular/core/testing"
import { State, Store, StoreModule } from "@ngrx/store"
import { Mesh, MeshBasicMaterial, PlaneGeometry, Texture, Vector3 } from "three"
import { TEST_LEAF_NODE_WITHOUT_EXTENSION, TEST_NODE_LEAF, TEST_NODE_LEAF_0_LENGTH, TEST_NODES } from "../../mocks/dataMocks"
import { CcState, LayoutAlgorithm } from "../../model/codeCharta.model"
import { setEnableFloorLabels, setLayoutAlgorithm, setScaling } from "../../stores/mapState/mapState.write.facade"
import { appReducers, setStateMiddleware } from "../../stores/rootStore/store"
import { keepHighlight } from "../../stores/sharedView/sharedView.write.facade"
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
        Object.defineProperty(sceneHighlight(), "constantHighlight", { value: CONSTANT_HIGHLIGHT, writable: true, configurable: true })
    })

    function sceneHighlight() {
        return threeSceneService["highlight"]
    }

    describe("highlightBuildings", () => {
        it("should call highlightBuilding", () => {
            threeSceneService["mapMesh"].highlightBuilding = jest.fn()
            threeSceneService["threeRendererService"].render = jest.fn()

            threeSceneService.applyHighlights()

            expect(threeSceneService["mapMesh"].highlightBuilding).toHaveBeenCalledWith(
                sceneHighlight()["highlightedBuildingIds"],
                sceneHighlight()["primaryHighlightedBuilding"],
                null,
                state.getValue(),
                sceneHighlight()["constantHighlight"]
            )
            expect(threeSceneService["threeRendererService"].render).toHaveBeenCalled()
        })
    })

    describe("addBuildingsToHighlightingList", () => {
        it("should add the given building to the HighlightingList ", () => {
            sceneHighlight()["highlightedBuildingIds"].clear()
            sceneHighlight()["highlightedNodeIds"].clear()
            sceneHighlight()["primaryHighlightedBuilding"] = null

            threeSceneService.addBuildingsToHighlightingList(CODE_MAP_BUILDING)

            expect(sceneHighlight()["highlightedBuildingIds"].has(CODE_MAP_BUILDING.id)).toBe(true)
            expect(sceneHighlight()["primaryHighlightedBuilding"]).toBe(CODE_MAP_BUILDING)
        })
    })

    describe("showKeptHighlight", () => {
        const LEAF_PATH = "/root/big leaf"

        beforeEach(() => {
            Object.defineProperty(sceneHighlight(), "constantHighlight", { value: new Map(), writable: true, configurable: true })
            threeSceneService["threeRendererService"].render = jest.fn()
        })

        it("should light the buildings of the kept paths and repaint", () => {
            // Arrange
            jest.spyOn(sceneHighlight(), "apply")

            // Act
            threeSceneService.showKeptHighlight([LEAF_PATH, "/root/not drawn"])

            // Assert
            expect([...threeSceneService.getConstantHighlight().values()].map(({ node }) => node.path)).toEqual([LEAF_PATH])
            expect(sceneHighlight().apply).toHaveBeenCalled()
        })

        it("should repaint the default colours once nothing is kept any more", () => {
            // Arrange
            threeSceneService.showKeptHighlight([LEAF_PATH])
            jest.spyOn(threeSceneService["mapMesh"], "clearUnselectedBuildings")
            jest.spyOn(sceneHighlight(), "apply")

            // Act
            threeSceneService.showKeptHighlight([])

            // Assert
            expect(threeSceneService.getConstantHighlight().size).toBe(0)
            expect(threeSceneService["mapMesh"].clearUnselectedBuildings).toHaveBeenCalled()
            expect(sceneHighlight().apply).not.toHaveBeenCalled()
            expect(threeSceneService["threeRendererService"].render).toHaveBeenCalled()
        })

        it("should keep the hovered building lit once nothing is kept any more", () => {
            // Arrange
            const hoveredBuilding = threeSceneService["mapMesh"].getBuildingByPath("/root")
            threeSceneService.showKeptHighlight([LEAF_PATH])
            threeSceneService.addBuildingsToHighlightingList(hoveredBuilding)
            jest.spyOn(sceneHighlight(), "apply")

            // Act
            threeSceneService.showKeptHighlight([])

            // Assert
            expect(sceneHighlight()["highlightedBuildingIds"]).toEqual(new Set([hoveredBuilding.id]))
            expect(sceneHighlight().apply).toHaveBeenCalled()
        })

        it("should not repaint while nothing was or is kept", () => {
            // Arrange
            jest.spyOn(sceneHighlight(), "apply")

            // Act
            threeSceneService.showKeptHighlight([])

            // Assert
            expect(sceneHighlight().apply).not.toHaveBeenCalled()
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
            jest.spyOn(sceneHighlight(), "apply")

            // Act
            threeSceneService.setMapMesh(TEST_NODES, rebuiltMesh)

            // Assert
            expect(sceneHighlight().apply).toHaveBeenCalled()
        })

        it("should paint the kept highlight on a mesh updated in place", () => {
            // Arrange
            store.dispatch(setLayoutAlgorithm({ value: LayoutAlgorithm.StreetMap }))
            store.dispatch(keepHighlight({ paths: [LEAF_PATH] }))
            jest.spyOn(sceneHighlight(), "apply")

            // Act
            threeSceneService.updateMapMeshInPlace(TEST_NODES, TEST_NODES, state.getValue(), false)

            // Assert
            expect(threeSceneService.getConstantHighlight().size).toBe(1)
            expect(sceneHighlight().apply).toHaveBeenCalled()
        })

        it("should leave a rebuilt mesh undimmed while nothing is kept", () => {
            // Arrange
            store.dispatch(setLayoutAlgorithm({ value: LayoutAlgorithm.StreetMap }))
            const rebuiltMesh = new CodeMapMesh(TEST_NODES, state.getValue(), false)
            jest.spyOn(sceneHighlight(), "apply")

            // Act
            threeSceneService.setMapMesh(TEST_NODES, rebuiltMesh)

            // Assert
            expect(sceneHighlight().apply).not.toHaveBeenCalled()
        })
    })

    describe("highlightSingleBuilding", () => {
        it("should add a building to the highlighting list and call the highlight function", () => {
            jest.spyOn(sceneHighlight(), "add")
            jest.spyOn(sceneHighlight(), "apply").mockImplementation(() => {})
            sceneHighlight()["highlightedBuildingIds"].clear()
            sceneHighlight()["highlightedNodeIds"].clear()
            sceneHighlight()["primaryHighlightedBuilding"] = null

            threeSceneService.highlightSingleBuilding(CODE_MAP_BUILDING)

            expect(sceneHighlight().add).toHaveBeenCalledWith(CODE_MAP_BUILDING)
            expect(sceneHighlight().apply).toHaveBeenCalled()
        })
    })

    describe("prepareHighlightTransition", () => {
        it("should clear IDs and primary building without touching mesh colors", () => {
            // Arrange
            threeSceneService.addBuildingsToHighlightingList(CODE_MAP_BUILDING)

            // Act
            threeSceneService.prepareHighlightTransition()

            // Assert
            expect(sceneHighlight()["highlightedBuildingIds"].size).toBe(0)
            expect(sceneHighlight()["highlightedNodeIds"].size).toBe(0)
            expect(sceneHighlight()["primaryHighlightedBuilding"]).toBeNull()
        })
    })

    describe("clearHighlight", () => {
        it("should do nothing before any 3D map was built", () => {
            // Arrange
            threeSceneService["mapMesh"] = undefined
            threeSceneService.addBuildingsToHighlightingList(CODE_MAP_BUILDING)

            // Act
            threeSceneService.clearHighlight()

            // Assert
            expect(sceneHighlight()["highlightedBuildingIds"].size).toBe(1)
        })

        it("should clear the highlighting list", () => {
            threeSceneService.clearHighlight()

            expect(sceneHighlight()["highlightedBuildingIds"].size).toBe(0)
            expect(sceneHighlight()["primaryHighlightedBuilding"]).toBeNull()
        })
    })

    describe("applyClearHighlights", () => {
        it("should keep the kept highlight while it clears the hover highlight", () => {
            // Arrange
            const keptHighlight = new Map([[CODE_MAP_BUILDING.id, CODE_MAP_BUILDING]])
            Object.defineProperty(sceneHighlight(), "constantHighlight", { value: keptHighlight, writable: true, configurable: true })
            threeSceneService["threeRendererService"].render = jest.fn()
            threeSceneService.addBuildingsToHighlightingList(CODE_MAP_BUILDING_TS_NODE)

            // Act
            threeSceneService.applyClearHighlights()

            // Assert
            expect(sceneHighlight()["highlightedBuildingIds"].size).toBe(0)
            expect([...threeSceneService.getConstantHighlight().values()]).toEqual([CODE_MAP_BUILDING])
        })

        it("should call clearHighlight and render changes", () => {
            // Arrange
            Object.defineProperty(sceneHighlight(), "constantHighlight", { value: new Map(), writable: true, configurable: true })
            const renderSpy = jest.spyOn(threeSceneService["threeRendererService"], "render").mockImplementation(() => {})

            // Act
            threeSceneService.applyClearHighlights()

            // Assert
            expect(renderSpy).toHaveBeenCalled()
        })
    })

    describe("scaleHeight", () => {
        it("should scale the map without floor labels drawn", () => {
            // Arrange
            store.dispatch(setScaling({ value: new Vector3(1, 2, 3) }))

            // Act
            threeSceneService.scaleHeight()

            // Assert
            expect(threeSceneService.mapGeometry.scale).toEqual(new Vector3(1, 2, 3))
        })

        it("should update mapGeometry scaling to new vector", () => {
            const translateCanvasesMock = jest.fn()
            Object.defineProperty(threeSceneService["floorLabels"], "floorLabelDrawer", {
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
            Object.defineProperty(threeSceneService["floorLabels"], "floorLabelDrawer", {
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
        const floorLabelDrawerSpy = jest.spyOn(FloorLabelDrawer.prototype, "draw")

        beforeEach(() => {
            floorLabelDrawerSpy.mockReturnValue([])
        })

        afterEach(() => {
            floorLabelDrawerSpy.mockReset()
        })

        function floorLabelPlane() {
            const texture = new Texture()
            const material = new MeshBasicMaterial({ map: texture })
            const geometry = new PlaneGeometry()
            return { plane: new Mesh(geometry, material), disposables: [texture, material, geometry] }
        }

        function rebuildMesh() {
            threeSceneService.setMapMesh(TEST_NODES, new CodeMapMesh(TEST_NODES, state.getValue(), false))
        }

        it("should add the drawn floor labels to the scene", () => {
            // Arrange
            const { plane } = floorLabelPlane()
            jest.spyOn(FloorLabelDrawer.prototype, "draw").mockReturnValue([plane])

            // Act
            rebuildMesh()

            // Assert
            expect(threeSceneService.floorLabelPlanes.children).toEqual([plane])
            expect(threeSceneService.scene.children).toContain(threeSceneService.floorLabelPlanes)
        })

        it("should dispose the floor labels of the previous map before drawing new ones", () => {
            // Arrange
            const { plane, disposables } = floorLabelPlane()
            jest.spyOn(FloorLabelDrawer.prototype, "draw").mockReturnValueOnce([plane]).mockReturnValueOnce([])
            rebuildMesh()
            const disposeSpies = disposables.map(disposable => jest.spyOn(disposable, "dispose"))

            // Act
            rebuildMesh()

            // Assert
            for (const disposeSpy of disposeSpies) {
                expect(disposeSpy).toHaveBeenCalled()
            }
            expect(threeSceneService.floorLabelPlanes.children).toEqual([])
        })

        it("should not add floor labels for StreetMap and TreeMapStreet algorithms", () => {
            threeSceneService["notifyMapMeshChanged"] = jest.fn()
            const getRootNodeMock = jest.fn()
            const originalGetRootNode = threeSceneService["floorLabels"]["getRootNode"]
            threeSceneService["floorLabels"]["getRootNode"] = getRootNodeMock

            store.dispatch(setLayoutAlgorithm({ value: LayoutAlgorithm.StreetMap }))
            threeSceneService.setMapMesh([], new CodeMapMesh(TEST_NODES, state.getValue(), false))

            store.dispatch(setLayoutAlgorithm({ value: LayoutAlgorithm.TreeMapStreet }))
            threeSceneService.setMapMesh([], new CodeMapMesh(TEST_NODES, state.getValue(), false))

            expect(getRootNodeMock).not.toHaveBeenCalled()
            expect(floorLabelDrawerSpy).not.toHaveBeenCalled()

            threeSceneService["floorLabels"]["getRootNode"] = originalGetRootNode

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

    describe("clearHoverHighlight", () => {
        it("should clear the hover highlight and repaint", () => {
            // Arrange
            threeSceneService.addBuildingsToHighlightingList(CODE_MAP_BUILDING)
            jest.spyOn(sceneHighlight(), "apply").mockImplementation(() => {})

            // Act
            threeSceneService.clearHoverHighlight()

            // Assert
            expect(threeSceneService.getHighlightedBuilding()).toBeNull()
            expect(sceneHighlight().apply).toHaveBeenCalled()
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
            const fileNames = buildings.filter(b => sceneHighlight()["highlightedBuildingIds"].has(b.id)).map(b => b.node.name)
            expect(fileNames).toEqual([TEST_LEAF_NODE_WITHOUT_EXTENSION.name])
        })

        it("WHEN highlighting buildings with extensions then only files without extensions are highlighted", () => {
            threeSceneService.highlightBuildingsByExtension(new Set<string>(["ts"]))
            const buildings = threeSceneService["mapMesh"].getMeshDescription().buildings
            const fileNames = buildings.filter(b => sceneHighlight()["highlightedBuildingIds"].has(b.id)).map(b => b.node.name)
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
            expect(sceneHighlight()["highlightedBuildingIds"].size).toBe(0)
        })
    })
})
