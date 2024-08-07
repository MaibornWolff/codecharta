import { TestBed, fakeAsync, tick } from "@angular/core/testing"
import { BehaviorSubject } from "rxjs"
import { setCameraZoomFactor, zoomIn, zoomOut } from "./cameraZoomFactor.actions"
import { CameraZoomFactorEffect } from "./cameraZoomFactor.effect"
import { Action } from "@ngrx/store"
import { EffectsModule } from "@ngrx/effects"
import { provideMockActions } from "@ngrx/effects/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { ThreeRendererService } from "../../../../ui/codeMap/threeViewer/threeRenderer.service"
import { ThreeCameraService } from "../../../../ui/codeMap/threeViewer/threeCamera.service"
import { CodeMapLabelService } from "../../../../ui/codeMap/codeMap.label.service"
import { CodeMapMouseEventService } from "../../../../ui/codeMap/codeMap.mouseEvent.service"
import { ThreeOrbitControlsService } from "../../../../ui/codeMap/threeViewer/threeOrbitControls.service"
import { Vector3 } from "three"
import { cameraZoomFactorSelector } from "./cameraZoomFactor.selector"

describe("CameraZoomFactorEffect", () => {
    let actions$: BehaviorSubject<Action>
    let threeCameraService: ThreeCameraService
    let threeRendererService: ThreeRendererService
    let threeOrbitControlsService: ThreeOrbitControlsService
    let codeMapLabelService: CodeMapLabelService

    beforeEach(() => {
        actions$ = new BehaviorSubject({ type: "" })

        TestBed.configureTestingModule({
            imports: [EffectsModule.forRoot([CameraZoomFactorEffect])],
            providers: [
                {
                    provide: ThreeRendererService,
                    useValue: { render: jest.fn() }
                },
                {
                    provide: ThreeCameraService,
                    useValue: {
                        camera: { zoom: 1 },
                        setZoomFactor: jest.fn()
                    }
                },
                {
                    provide: CodeMapLabelService,
                    useValue: { onCameraChanged: jest.fn() }
                },
                {
                    provide: ThreeOrbitControlsService,
                    useValue: {
                        controls: {
                            target: new Vector3().clone(),
                            update: jest.fn(),
                            copy: jest.fn()
                        }
                    }
                },
                {
                    provide: CodeMapMouseEventService,
                    useValue: { getMouse3D: jest.fn().mockReturnValue(new Vector3().clone()) }
                },
                provideMockStore({
                    selectors: [
                        {
                            selector: cameraZoomFactorSelector,
                            value: 1
                        }
                    ]
                }),
                provideMockActions(() => actions$)
            ]
        })
        TestBed.inject(MockStore)
        threeCameraService = TestBed.inject(ThreeCameraService)
        threeRendererService = TestBed.inject(ThreeRendererService)
        threeOrbitControlsService = TestBed.inject(ThreeOrbitControlsService)
        codeMapLabelService = TestBed.inject(CodeMapLabelService)
        TestBed.inject(CodeMapMouseEventService)
    })

    afterEach(() => {
        actions$.complete()
        jest.clearAllMocks()
    })

    it("should handle setCameraZoomFactor action", fakeAsync(() => {
        const expectedZoom = 1.5

        actions$.next(setCameraZoomFactor({ value: expectedZoom }))

        tick(300) // duration of the animation

        expect(threeCameraService.setZoomFactor).toHaveBeenCalled()
        expect(threeRendererService.render).toHaveBeenCalled()
        expect(codeMapLabelService.onCameraChanged).toHaveBeenCalled()
        expect(threeOrbitControlsService.controls.update).toHaveBeenCalled()
    }))

    it("should handle zoomIn action", fakeAsync(() => {
        actions$.next(zoomIn())

        tick(300)

        expect(threeCameraService.setZoomFactor).toHaveBeenCalled()
        expect(threeRendererService.render).toHaveBeenCalled()
        expect(codeMapLabelService.onCameraChanged).toHaveBeenCalled()
        expect(threeOrbitControlsService.controls.update).toHaveBeenCalled()
    }))

    it("should handle zoomOut action", fakeAsync(() => {
        actions$.next(zoomOut())

        tick(300)

        expect(threeCameraService.setZoomFactor).toHaveBeenCalled()
        expect(threeRendererService.render).toHaveBeenCalled()
        expect(codeMapLabelService.onCameraChanged).toHaveBeenCalled()
        expect(threeOrbitControlsService.controls.update).toHaveBeenCalled()
    }))
})
