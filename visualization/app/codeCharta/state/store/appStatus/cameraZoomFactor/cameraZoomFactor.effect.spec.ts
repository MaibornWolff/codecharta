import { TestBed } from "@angular/core/testing"
import { BehaviorSubject } from "rxjs"
import { CameraZoomFactorEffect } from "./cameraZoomFactor.effect"
import { ThreeRendererService } from "../../../../ui/codeMap/threeViewer/threeRenderer.service"
import { ThreeCameraService } from "../../../../ui/codeMap/threeViewer/threeCamera.service"
import { CodeMapLabelService } from "../../../../ui/codeMap/codeMap.label.service"
import { CodeMapMouseEventService } from "../../../../ui/codeMap/codeMap.mouseEvent.service"
import { ThreeOrbitControlsService } from "../../../../ui/codeMap/threeViewer/threeOrbitControls.service"
import { ThreeSceneService } from "../../../../ui/codeMap/threeViewer/threeSceneService"
import { EffectsModule } from "@ngrx/effects"
import { Action } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { provideMockActions } from "@ngrx/effects/testing"
import { cameraZoomFactorSelector } from "./cameraZoomFactor.selector"
import { setCameraZoomFactor, zoomIn, zoomOut } from "./cameraZoomFactor.actions"
import { CcState } from "../../../../codeCharta.model"
import { PerspectiveCamera } from "three"

describe("CameraZoomFactorEffect", () => {
    let actions$: BehaviorSubject<Action>
    let store: MockStore<CcState>
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let effect: CameraZoomFactorEffect
    let threeRendererService: Partial<ThreeRendererService>
    let threeCameraService: Partial<ThreeCameraService>
    let codeMapLabelService: Partial<CodeMapLabelService>
    let codeMapMouseEventService: Partial<CodeMapMouseEventService>
    let threeOrbitControlsService: Partial<ThreeOrbitControlsService>
    let threeSceneService: Partial<ThreeSceneService>

    beforeEach(() => {
        actions$ = new BehaviorSubject<Action>({ type: "" })

        threeRendererService = { render: jest.fn() }
        threeCameraService = {
            setZoomFactor: jest.fn(),
            camera: new PerspectiveCamera() // Initialize camera correctly
        }
        codeMapLabelService = { onCameraChanged: jest.fn() }
        codeMapMouseEventService = { getmouse3D: jest.fn().mockReturnValue({ clone: jest.fn().mockReturnValue({}) }) }
        // @ts-ignore
        threeOrbitControlsService = { controls: { target: { copy: jest.fn() }, update: jest.fn() } }
        threeSceneService = {}

        TestBed.configureTestingModule({
            imports: [EffectsModule.forRoot([CameraZoomFactorEffect])],
            providers: [
                provideMockStore({
                    selectors: [{ selector: cameraZoomFactorSelector, value: 1 }]
                }),
                provideMockActions(() => actions$),
                { provide: ThreeRendererService, useValue: threeRendererService },
                { provide: ThreeCameraService, useValue: threeCameraService },
                { provide: CodeMapLabelService, useValue: codeMapLabelService },
                { provide: CodeMapMouseEventService, useValue: codeMapMouseEventService },
                { provide: ThreeOrbitControlsService, useValue: threeOrbitControlsService },
                { provide: ThreeSceneService, useValue: threeSceneService }
            ]
        })

        store = TestBed.inject(MockStore)
        effect = TestBed.inject(CameraZoomFactorEffect)
    })

    afterEach(() => {
        actions$.complete()
    })

    it("should set the camera zoom when setCameraZoomFactor action is dispatched", done => {
        actions$.next(setCameraZoomFactor({ value: 2 }))

        setTimeout(() => {
            expect(threeCameraService.setZoomFactor).toHaveBeenCalledWith(2)
            expect(threeRendererService.render).toHaveBeenCalled()
            expect(codeMapLabelService.onCameraChanged).toHaveBeenCalled()
            done()
        }, 0)
    })

    it("should set the camera zoom when zoomIn action is dispatched", done => {
        store.overrideSelector(cameraZoomFactorSelector, 2)
        store.refreshState()
        actions$.next(zoomIn())

        setTimeout(() => {
            expect(threeCameraService.setZoomFactor).toHaveBeenCalledWith(3)
            expect(threeRendererService.render).toHaveBeenCalled()
            expect(codeMapLabelService.onCameraChanged).toHaveBeenCalled()
            done()
        }, 0)
    })

    it("should set the camera zoom when zoomOut action is dispatched", done => {
        store.overrideSelector(cameraZoomFactorSelector, 2)
        store.refreshState()
        actions$.next(zoomOut())

        setTimeout(() => {
            expect(threeCameraService.setZoomFactor).toHaveBeenCalledWith(1)
            expect(threeRendererService.render).toHaveBeenCalled()
            expect(codeMapLabelService.onCameraChanged).toHaveBeenCalled()
            done()
        }, 0)
    })
})
