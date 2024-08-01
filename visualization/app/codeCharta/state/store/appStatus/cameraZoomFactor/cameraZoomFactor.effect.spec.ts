import { TestBed } from "@angular/core/testing"
import { provideMockActions } from "@ngrx/effects/testing"
import { provideMockStore, MockStore } from "@ngrx/store/testing"
import { BehaviorSubject } from "rxjs"
import { cameraZoomFactorEffect } from "./cameraZoomFactor.effect"
import { ThreeRendererService } from "../../../../ui/codeMap/threeViewer/threeRenderer.service"
import { ThreeCameraService } from "../../../../ui/codeMap/threeViewer/threeCamera.service"
import { cameraZoomFactorSelector } from "./cameraZoomFactor.selector"
import { Action } from "@ngrx/store"
import { EffectsModule } from "@ngrx/effects"
import { MatDialog } from "@angular/material/dialog"
import { getLastAction } from "../../../../util/testUtils/store.utils"
import { setCameraZoomFactor } from "./cameraZoomFactor.actions"

describe("cameraZoomFactorEffect", () => {
    const mockedDialog = { open: jest.fn() }
    let actions$: BehaviorSubject<Action>
    let store: MockStore
    let threeCameraService: ThreeCameraService
    let threeRendererService: ThreeRendererService

    beforeEach(() => {
        actions$ = new BehaviorSubject({ type: "" })
        mockedDialog.open = jest.fn()

        TestBed.configureTestingModule({
            imports: [EffectsModule.forRoot([cameraZoomFactorEffect])],
            providers: [
                { provide: MatDialog, useValue: mockedDialog },
                { provide: ThreeRendererService, useValue: { render: jest.fn() } },
                { provide: ThreeCameraService, useValue: { setZoomFactor: jest.fn() } },
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
        store = TestBed.inject(MockStore)
        threeCameraService = TestBed.inject(ThreeCameraService)
        threeRendererService = TestBed.inject(ThreeRendererService)
    })

    afterEach(() => {
        actions$.complete()
    })

    it("should ignore a not relevant action", async () => {
        actions$.next({ type: "whatever" })
        expect(await getLastAction(store)).toEqual({ type: "@ngrx/effects/init" })
        expect(mockedDialog.open).not.toHaveBeenCalled()
    })

    it("should call setZoomFactor and rerender", () => {
        actions$.next(setCameraZoomFactor({ value: 1 }))
        expect(threeCameraService.setZoomFactor).toHaveBeenCalledWith(1)
        expect(threeRendererService.render).toHaveBeenCalled()
    })
})
