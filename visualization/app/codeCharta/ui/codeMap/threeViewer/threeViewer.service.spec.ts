import { TestBed } from "@angular/core/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { State } from "@ngrx/store"
import { ThreeSceneService } from "./threeSceneService"
import { ThreeCameraService } from "./threeCamera.service"
import { ThreeMapControlsService } from "./threeMapControls.service"
import { ThreeRendererService } from "./threeRenderer.service"
import { ThreeViewerService } from "./threeViewer.service"
import { PerspectiveCamera, Scene, Vector3, WebGLRenderer } from "three"
import { ThreeStatsService } from "./threeStats.service"
import { CustomComposer } from "../rendering/postprocessor/customComposer"
import { MapControls } from "three/examples/jsm/controls/MapControls"

describe("ThreeViewerService", () => {
    let threeViewerService: ThreeViewerService
    let threeSceneService: ThreeSceneService
    let threeCameraService: ThreeCameraService
    let threeMapControlsService: ThreeMapControlsService
    let threeRendererService: ThreeRendererService
    let threeStatsService: ThreeStatsService

    let element: jest.Mocked<Element>

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideMockStore(), { provide: State, useValue: {} }]
        })
        setupMocks()
        createService()
    })

    function setupMocks() {
        threeSceneService = {
            scene: {
                position: new Vector3(1, 2, 3),
                add: jest.fn(),
                updateMatrixWorld: jest.fn()
            } as unknown as jest.Mocked<Scene>
        } as unknown as ThreeSceneService

        threeCameraService = {
            camera: new PerspectiveCamera()
        } as jest.Mocked<ThreeCameraService>
        threeCameraService.camera.lookAt = jest.fn()
        threeCameraService.camera.updateProjectionMatrix = jest.fn()
        threeCameraService.init = jest.fn()

        threeRendererService = {
            render: jest.fn(),
            renderer: {
                domElement: { height: 1, width: 1 },
                setSize: jest.fn(),
                dispose: jest.fn(),
                getContext: jest.fn(),
                setPixelRatio: jest.fn()
            } as unknown as WebGLRenderer,
            composer: {
                dispose: jest.fn()
            } as unknown as CustomComposer,
            init: jest.fn()
        } as unknown as ThreeRendererService

        threeMapControlsService = {
            controls: {
                listenToKeyEvents: jest.fn(),
                stopListenToKeyEvents: jest.fn(),
                update: jest.fn()
            } as unknown as jest.Mocked<MapControls>,
            init: jest.fn(),
            autoFitTo: jest.fn()
        } as unknown as ThreeMapControlsService

        threeStatsService = {
            init: jest.fn(),
            updateStats: jest.fn(),
            destroy: jest.fn()
        } as unknown as ThreeStatsService

        element = { append: jest.fn() } as any
        window.addEventListener = jest.fn()
    }

    function createService() {
        threeViewerService = new ThreeViewerService(
            threeSceneService,
            threeCameraService,
            threeMapControlsService,
            threeRendererService,
            threeStatsService
        )
    }

    describe("init", () => {
        it("should init threeCameraService", () => {
            threeViewerService.init(element)

            expect(threeCameraService.init).toHaveBeenCalledWith(window.innerWidth, window.innerHeight)
        })

        it("should call camera.lookAt", () => {
            threeViewerService.init(element)

            expect(threeCameraService.camera.lookAt).toHaveBeenCalledWith(threeSceneService.scene.position)
        })

        it("should call scene.add", () => {
            threeViewerService.init(element)

            expect(threeSceneService.scene.add).toHaveBeenCalledWith(threeCameraService.camera)
        })

        it("should init threeRendererService", () => {
            threeViewerService.init(element)

            expect(threeRendererService.init).toHaveBeenCalledWith(
                window.innerWidth,
                window.innerHeight,
                threeSceneService.scene,
                threeCameraService.camera
            )
        })

        it("should init threeMapControlsService", () => {
            threeViewerService.init(element)

            expect(threeMapControlsService.init).toHaveBeenCalledWith(threeRendererService.renderer.domElement)
        })

        it("should call append", () => {
            threeViewerService.init(element)

            expect(element.append).toHaveBeenCalledWith(threeRendererService.renderer.domElement)
        })

        it("should setup three event listeners", () => {
            threeViewerService.init(element)

            expect(window.addEventListener).toHaveBeenCalledWith("resize", expect.any(Function))
            expect(window.addEventListener).toHaveBeenCalledWith("focusin", expect.any(Function))
            expect(window.addEventListener).toHaveBeenCalledWith("focusout", expect.any(Function))
        })
    })

    describe("onWindowResize", () => {
        it("should call scene.updateMatrixWorld with false", () => {
            threeViewerService.onWindowResize()

            expect(threeSceneService.scene.updateMatrixWorld).toHaveBeenCalledWith(false)
        })

        it("should call renderer.setSize", () => {
            threeViewerService.onWindowResize()

            expect(threeRendererService.renderer.setSize).toHaveBeenCalledWith(window.innerWidth, window.innerHeight)
        })

        it("should set camera.aspect correctly", () => {
            threeViewerService.onWindowResize()

            expect(threeCameraService.camera.aspect).toBe(window.innerWidth / window.innerHeight)
        })

        it("should call camera.updateProjectionMatrix", () => {
            threeViewerService.onWindowResize()

            expect(threeCameraService.camera.updateProjectionMatrix).toHaveBeenCalled()
        })
    })

    describe("onFocusIn", () => {
        it("should disable key event listener", () => {
            const inputEvent = { target: { nodeName: "INPUT" } }
            threeViewerService.onFocusIn(inputEvent as any)

            expect(threeMapControlsService.controls.stopListenToKeyEvents).toHaveBeenCalled()
        })
    })

    describe("onFocusOut", () => {
        it("should enable key event listener", () => {
            const inputEvent = { target: { nodeName: "INPUT" } }
            threeViewerService.onFocusOut(inputEvent as any)

            expect(threeMapControlsService.controls.listenToKeyEvents).toHaveBeenCalledWith(window)
        })
    })

    describe("animate", () => {
        it("should call controls.update", () => {
            threeViewerService.animate()

            expect(threeMapControlsService.controls.update).toHaveBeenCalled()
        })

        it("should call update", () => {
            threeViewerService.animate()

            expect(threeRendererService.render).toHaveBeenCalled()
        })
    })

    describe("animateStats", () => {
        it("should call threeStatsService updateStats", () => {
            threeViewerService.animateStats()

            expect(threeStatsService.updateStats).toHaveBeenCalled()
        })
    })

    describe("getRenderCanvas", () => {
        it("should return dom element", () => {
            expect(threeViewerService.getRenderCanvas()).toEqual(threeRendererService.renderer.domElement)
        })
    })

    describe("autoFitTo", () => {
        it("should call map control autoFitTo", () => {
            threeViewerService.autoFitTo()

            expect(threeMapControlsService.autoFitTo).toHaveBeenCalled()
        })
    })
})
