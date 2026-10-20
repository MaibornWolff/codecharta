import { TestBed } from "@angular/core/testing"
import { Store } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { klona } from "klona"
import { LabelSettingsFacade } from "../../features/labelSettings/facade"
import { TEST_FILE_WITH_PATHS } from "../../mocks/dataMocks"
import { provideMockState } from "../../mocks/state.mocks"
import { CcState } from "../../model/codeCharta.model"
import { CodeMapTooltipService } from "../../renderer/threeViewer/codeMap.tooltip.service"
import { CursorType } from "../../renderer/threeViewer/cursorIndicator"
import { IdToBuildingService } from "../../renderer/threeViewer/idToBuilding.service"
import { CodeMapBuilding } from "../../renderer/threeViewer/rendering/codeMapBuilding"
import { CODE_MAP_BUILDING, CONSTANT_HIGHLIGHT } from "../../renderer/threeViewer/rendering/codeMapBuilding.mocks"
import { ThreeCameraService } from "../../renderer/threeViewer/threeCamera.service"
import { ThreeRendererService } from "../../renderer/threeViewer/threeRenderer.service"
import { ThreeSceneService } from "../../renderer/threeViewer/threeSceneService"
import { ThreeMapVisibilityStore } from "../../renderer/threeViewer/threeViewer.facade"
import { ThreeViewerService } from "../../renderer/threeViewer/threeViewer.service"
import { FileStoreReadWindow } from "../../stores/fileStore/fileStore.facade"
import { SharedViewReadWindow } from "../../stores/sharedView/sharedView.read.facade"
import { NodeDecorator } from "../../util/nodeDecorator"
import { ViewCubeMouseEventsService } from "../viewCube/facade"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"
import { CodeMapStore } from "./stores/codeMap.store"

export function setUpCodeMapMouseEventService() {
    let codeMapMouseEventService: CodeMapMouseEventService
    let threeCameraService: ThreeCameraService
    let threeRendererService: ThreeRendererService
    let threeSceneService: ThreeSceneService
    let store: Store<CcState>
    let codeMapStore: CodeMapStore
    let fileStoreReadWindow: FileStoreReadWindow
    let sharedViewReadWindow: SharedViewReadWindow
    let labelSettingsFacade: LabelSettingsFacade
    let tooltipService: CodeMapTooltipService
    let viewCubeMouseEventsService: ViewCubeMouseEventsService
    let threeViewerService: ThreeViewerService
    let idToBuildingService: IdToBuildingService

    let codeMapBuilding: CodeMapBuilding

    restartSystem()
    rebuildService()
    withMockedWindow()
    withMockedThreeRendererService()
    withMockedThreeCameraService()
    withMockedThreeSceneService()
    NodeDecorator.decorateMap(
        TEST_FILE_WITH_PATHS.map,
        {
            nodeMetricData: [],
            edgeMetricData: []
        },
        []
    )
    const constantHighlight = new Map(CONSTANT_HIGHLIGHT)

    return {
        codeMapMouseEventService,
        threeCameraService,
        threeRendererService,
        threeSceneService,
        store,
        labelSettingsFacade,
        tooltipService,
        viewCubeMouseEventsService,
        threeViewerService,
        idToBuildingService,
        constantHighlight,
        codeMapBuilding,
        rebuildService
    }

    function restartSystem() {
        TestBed.configureTestingModule({
            providers: [provideMockStore(), provideMockState()]
        })
        threeCameraService = TestBed.inject(ThreeCameraService)
        threeRendererService = TestBed.inject(ThreeRendererService)
        threeSceneService = TestBed.inject(ThreeSceneService)
        threeSceneService.getMapMesh = jest.fn().mockReturnValue({
            clearHighlight: jest.fn(),
            highlightSingleBuilding: jest.fn(),
            clearSelection: jest.fn(),
            selectBuilding: jest.fn(),
            getMeshDescription: jest.fn().mockReturnValue({
                buildings: [codeMapBuilding]
            }),
            checkMouseRayMeshIntersection: jest.fn()
        })
        threeSceneService.getSelectedBuilding = jest.fn().mockReturnValue(CODE_MAP_BUILDING)
        threeSceneService.getHighlightedBuilding = jest.fn().mockReturnValue(CODE_MAP_BUILDING)
        threeSceneService.getConstantHighlight = jest.fn().mockReturnValue(new Map())

        store = TestBed.inject(MockStore)
        codeMapStore = TestBed.inject(CodeMapStore)
        fileStoreReadWindow = TestBed.inject(FileStoreReadWindow)
        sharedViewReadWindow = TestBed.inject(SharedViewReadWindow)
        threeViewerService = TestBed.inject(ThreeViewerService)
        viewCubeMouseEventsService = {
            subscribe: jest.fn(),
            propagateMovement: jest.fn(),
            resetIsDragging: jest.fn(),
            onDocumentDoubleClick: jest.fn()
        } as unknown as ViewCubeMouseEventsService
        idToBuildingService = TestBed.inject(IdToBuildingService)
        labelSettingsFacade = TestBed.inject(LabelSettingsFacade)
        labelSettingsFacade["threeSceneService"] = threeSceneService
        tooltipService = {
            show: jest.fn(),
            hide: jest.fn(),
            updatePosition: jest.fn(),
            isVisible: jest.fn().mockReturnValue(false),
            getCurrentNodeId: jest.fn().mockReturnValue(null),
            getRect: jest.fn().mockReturnValue(null),
            dispose: jest.fn()
        } as unknown as CodeMapTooltipService

        codeMapBuilding = klona(CODE_MAP_BUILDING)
        document.body.style.cursor = CursorType.Default
    }

    function rebuildService() {
        codeMapMouseEventService = new CodeMapMouseEventService(
            threeCameraService,
            threeRendererService,
            threeSceneService,
            codeMapStore,
            fileStoreReadWindow,
            sharedViewReadWindow,
            TestBed.inject(ThreeMapVisibilityStore),
            labelSettingsFacade,
            tooltipService,
            viewCubeMouseEventsService,
            threeViewerService,
            idToBuildingService
        )

        Object.defineProperty(codeMapMouseEventService, "oldMouse", { value: { x: 1, y: 1 }, writable: true, configurable: true })
        return codeMapMouseEventService
    }

    function withMockedWindow() {
        window.open = jest.fn()
    }

    function withMockedThreeRendererService() {
        threeRendererService = jest.fn().mockReturnValue({
            renderer: {
                domElement: {
                    addEventListener: jest.fn(),
                    getBoundingClientRect: jest.fn().mockReturnValue({
                        top: 0
                    }),
                    width: 1,
                    height: 1
                },
                getPixelRatio: jest.fn().mockReturnValue(2)
            },
            render: jest.fn()
        })()
        Object.defineProperty(codeMapMouseEventService, "threeRendererService", {
            value: threeRendererService,
            writable: true,
            configurable: true
        })
    }

    function withMockedThreeCameraService() {
        threeCameraService = jest.fn().mockReturnValue({
            camera: {
                updateMatrixWorld: jest.fn()
            }
        })()
        Object.defineProperty(codeMapMouseEventService, "threeCameraService", {
            value: threeCameraService,
            writable: true,
            configurable: true
        })
    }

    function withMockedThreeSceneService() {
        threeSceneService = jest.fn().mockReturnValue({
            getMapMesh: jest.fn().mockReturnValue({
                clearHighlight: jest.fn(),
                highlightSingleBuilding: jest.fn(),
                clearSelection: jest.fn(),
                selectBuilding: jest.fn(),
                getMeshDescription: jest.fn().mockReturnValue({
                    buildings: [codeMapBuilding]
                }),
                checkMouseRayMeshIntersection: jest.fn()
            }),
            clearHighlight: jest.fn(),
            highlightSingleBuilding: jest.fn(),
            clearSelection: jest.fn(),
            clearHoverHighlight: jest.fn(),
            selectBuilding: jest.fn(),
            getSelectedBuilding: jest.fn().mockReturnValue(CODE_MAP_BUILDING),
            getHighlightedBuilding: jest.fn().mockReturnValue(CODE_MAP_BUILDING),
            getConstantHighlight: jest.fn().mockReturnValue(new Map()),
            addBuildingsToHighlightingList: jest.fn(),
            applyHighlights: jest.fn()
        })()
        Object.defineProperty(codeMapMouseEventService, "threeSceneService", {
            value: threeSceneService,
            writable: true,
            configurable: true
        })
    }
}
