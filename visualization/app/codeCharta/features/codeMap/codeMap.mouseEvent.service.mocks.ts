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

export interface CodeMapMouseEventTestContext {
    codeMapMouseEventService: CodeMapMouseEventService
    threeCameraService: ThreeCameraService
    threeRendererService: ThreeRendererService
    threeSceneService: ThreeSceneService
    store: Store<CcState>
    labelSettingsFacade: LabelSettingsFacade
    tooltipService: CodeMapTooltipService
    viewCubeMouseEventsService: ViewCubeMouseEventsService
    threeViewerService: ThreeViewerService
    idToBuildingService: IdToBuildingService
    constantHighlight: Map<number, CodeMapBuilding>
    codeMapBuilding: CodeMapBuilding
    rebuildService: () => CodeMapMouseEventService
}

export function setUpCodeMapMouseEventService(): CodeMapMouseEventTestContext {
    const context = restartSystem()
    context.rebuildService()
    window.open = jest.fn()
    withMockedThreeRendererService(context)
    withMockedThreeCameraService(context)
    withMockedThreeSceneService(context)
    NodeDecorator.decorateMap(TEST_FILE_WITH_PATHS.map, { nodeMetricData: [], edgeMetricData: [] }, [])
    context.constantHighlight = new Map(CONSTANT_HIGHLIGHT)
    return context
}

function restartSystem(): CodeMapMouseEventTestContext {
    TestBed.configureTestingModule({
        providers: [provideMockStore(), provideMockState()]
    })
    const context: CodeMapMouseEventTestContext = {
        codeMapMouseEventService: undefined,
        threeCameraService: TestBed.inject(ThreeCameraService),
        threeRendererService: TestBed.inject(ThreeRendererService),
        threeSceneService: withMockedSceneGetters(TestBed.inject(ThreeSceneService)),
        store: TestBed.inject(MockStore),
        threeViewerService: TestBed.inject(ThreeViewerService),
        viewCubeMouseEventsService: mockViewCubeMouseEventsService(),
        idToBuildingService: TestBed.inject(IdToBuildingService),
        labelSettingsFacade: TestBed.inject(LabelSettingsFacade),
        tooltipService: mockTooltipService(),
        codeMapBuilding: klona(CODE_MAP_BUILDING),
        constantHighlight: undefined,
        rebuildService: () => rebuildService(context)
    }
    context.labelSettingsFacade["threeSceneService"] = context.threeSceneService
    document.body.style.cursor = CursorType.Default
    return context
}

function withMockedSceneGetters(threeSceneService: ThreeSceneService) {
    threeSceneService.getMapMesh = jest.fn().mockReturnValue(mockMapMesh(undefined))
    threeSceneService.getSelectedBuilding = jest.fn().mockReturnValue(CODE_MAP_BUILDING)
    threeSceneService.getHighlightedBuilding = jest.fn().mockReturnValue(CODE_MAP_BUILDING)
    threeSceneService.getConstantHighlight = jest.fn().mockReturnValue(new Map())
    return threeSceneService
}

function mockMapMesh(building: CodeMapBuilding) {
    return {
        clearHighlight: jest.fn(),
        highlightSingleBuilding: jest.fn(),
        clearSelection: jest.fn(),
        selectBuilding: jest.fn(),
        getMeshDescription: jest.fn().mockReturnValue({
            buildings: [building]
        }),
        checkMouseRayMeshIntersection: jest.fn()
    }
}

function mockViewCubeMouseEventsService() {
    return {
        subscribe: jest.fn(),
        propagateMovement: jest.fn(),
        resetIsDragging: jest.fn(),
        onDocumentDoubleClick: jest.fn()
    } as unknown as ViewCubeMouseEventsService
}

function mockTooltipService() {
    return {
        show: jest.fn(),
        hide: jest.fn(),
        updatePosition: jest.fn(),
        isVisible: jest.fn().mockReturnValue(false),
        getCurrentNodeId: jest.fn().mockReturnValue(null),
        getRect: jest.fn().mockReturnValue(null),
        dispose: jest.fn()
    } as unknown as CodeMapTooltipService
}

function rebuildService(context: CodeMapMouseEventTestContext) {
    context.codeMapMouseEventService = new CodeMapMouseEventService(
        context.threeCameraService,
        context.threeRendererService,
        context.threeSceneService,
        TestBed.inject(CodeMapStore),
        TestBed.inject(FileStoreReadWindow),
        TestBed.inject(SharedViewReadWindow),
        TestBed.inject(ThreeMapVisibilityStore),
        context.labelSettingsFacade,
        context.tooltipService,
        context.viewCubeMouseEventsService,
        context.threeViewerService,
        context.idToBuildingService
    )
    replaceServiceField(context, "oldMouse", { x: 1, y: 1 })
    return context.codeMapMouseEventService
}

function withMockedThreeRendererService(context: CodeMapMouseEventTestContext) {
    context.threeRendererService = {
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
    } as unknown as ThreeRendererService
    replaceServiceField(context, "threeRendererService", context.threeRendererService)
}

function withMockedThreeCameraService(context: CodeMapMouseEventTestContext) {
    context.threeCameraService = {
        camera: {
            updateMatrixWorld: jest.fn()
        }
    } as unknown as ThreeCameraService
    replaceServiceField(context, "threeCameraService", context.threeCameraService)
}

function withMockedThreeSceneService(context: CodeMapMouseEventTestContext) {
    context.threeSceneService = {
        getMapMesh: jest.fn().mockReturnValue(mockMapMesh(context.codeMapBuilding)),
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
    } as unknown as ThreeSceneService
    replaceServiceField(context, "threeSceneService", context.threeSceneService)
}

function replaceServiceField(context: CodeMapMouseEventTestContext, field: string, value: unknown) {
    Object.defineProperty(context.codeMapMouseEventService, field, { value, writable: true, configurable: true })
}
