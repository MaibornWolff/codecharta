import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { ThreeOrbitControlsService } from "../../codeMap/threeViewer/threeOrbitControls.service"
import { CenterMapButtonComponent } from "./centerMapButton.component"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { setCameraZoomFactor } from "../../../state/store/appStatus/cameraZoomFactor/cameraZoomFactor.actions"

describe("CenterMapButtonComponent", () => {
    const threeOrbitControlsService = { autoFitTo: jest.fn() } as unknown as ThreeOrbitControlsService
    let store: Store<CcState>
    let mockedStore: Partial<Store<CcState>>

    beforeEach(async () => {
        threeOrbitControlsService.autoFitTo = jest.fn()
        mockedStore = {
            dispatch: jest.fn()
        }

        await render(CenterMapButtonComponent, {
            providers: [
                { provide: ThreeOrbitControlsService, useValue: threeOrbitControlsService },
                { provide: Store, useValue: mockedStore }
            ]
        })
        store = mockedStore as Store<CcState>
    })

    it("should call autoFitTo of threeOrbitControlsService on click", async () => {
        new CenterMapButtonComponent(threeOrbitControlsService, store)

        await userEvent.click(screen.getByTitle("Center map"))

        expect(threeOrbitControlsService.autoFitTo).toHaveBeenCalled()
        expect(store.dispatch).toHaveBeenCalledWith(setCameraZoomFactor({ value: 1 }))
    })
})
