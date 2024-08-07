import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { ZoomSliderComponent } from "./zoomSlider.component"
import { CcState } from "../../../codeCharta.model"
import { zoomIn, zoomOut } from "../../../state/store/appStatus/cameraZoomFactor/cameraZoomFactor.actions"
import { Store } from "@ngrx/store"
import { cameraZoomFactorSelector } from "../../../state/store/appStatus/cameraZoomFactor/cameraZoomFactor.selector"
import { of } from "rxjs"

describe("ZoomSliderComponent", () => {
    let store: Store<CcState>
    const initialZoomFactor = 1

    let mockedStore: Partial<Store<CcState>>

    beforeEach(async () => {
        mockedStore = {
            dispatch: jest.fn(),
            select: jest.fn().mockReturnValue(of(initialZoomFactor))
        }

        await render(ZoomSliderComponent, {
            providers: [{ provide: Store, useValue: mockedStore }]
        })

        store = mockedStore as Store<CcState>
    })

    it("should subscribe to zoom state", () => {
        const zoomSliderComponent = new ZoomSliderComponent(store)
        expect(store.select).toHaveBeenCalledWith(cameraZoomFactorSelector)
        expect(zoomSliderComponent.zoomFactor).toBe(initialZoomFactor * 100)
    })

    it("should dispatch zoomIn action on zoom in button click", async () => {
        new ZoomSliderComponent(store)
        const zoomInButton = screen.getByTestId("zoomIn")
        await userEvent.click(zoomInButton)

        expect(store.dispatch).toHaveBeenCalledWith(zoomIn())
    })

    it("should dispatch zoomOut action on zoom out button click", async () => {
        new ZoomSliderComponent(store)
        const zoomOutButton = screen.getByTestId("zoomOut")
        await userEvent.click(zoomOutButton)

        expect(store.dispatch).toHaveBeenCalledWith(zoomOut())
    })
})
