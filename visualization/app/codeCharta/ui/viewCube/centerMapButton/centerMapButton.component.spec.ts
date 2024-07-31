import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { ThreeOrbitControlsService } from "../../codeMap/threeViewer/threeOrbitControls.service"
import { CenterMapButtonComponent } from "./centerMapButton.component"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { setCameraZoomFactor } from "../../../state/store/appStatus/cameraZoomFactor/cameraZoomFactor.actions"
import { MockStore, provideMockStore } from "@ngrx/store/testing"

describe("CenterMapButtonComponent", () => {
    const threeOrbitControlsService = { autoFitTo: jest.fn() }
    let store: Store<CcState>

    beforeEach(() => {
        threeOrbitControlsService.autoFitTo = jest.fn()
        TestBed.configureTestingModule({
            providers: [provideMockStore(), { provide: ThreeOrbitControlsService, useValue: threeOrbitControlsService }]
        })
        store = TestBed.inject(MockStore)
        store.dispatch = jest.fn()
    })

    it("should call autoFitTo of threeOrbitControlsService on click", async () => {
        await render(CenterMapButtonComponent)

        await userEvent.click(screen.getByTitle("Center map"))

        expect(threeOrbitControlsService.autoFitTo).toHaveBeenCalled()
        expect(store.dispatch).toHaveBeenCalledWith(setCameraZoomFactor({ value: 1 }))
    })
})
