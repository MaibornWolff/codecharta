import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { ZoomSliderComponent } from "./zoomSlider.component"
import { CcState } from "../../../codeCharta.model"
import { setCameraZoomFactor, zoomIn, zoomOut } from "../../../state/store/appStatus/cameraZoomFactor/cameraZoomFactor.actions"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { cameraZoomFactorSelector } from "../../../state/store/appStatus/cameraZoomFactor/cameraZoomFactor.selector"

describe("ZoomSliderComponent", () => {
    let store: MockStore<CcState>
    const initialZoomFactor = 1

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ZoomSliderComponent],
            providers: [
                provideMockStore({
                    selectors: [{ selector: cameraZoomFactorSelector, value: initialZoomFactor }]
                })
            ]
        }).compileComponents()

        store = TestBed.inject(MockStore)
        store.dispatch = jest.fn()
    })

    it("should initialize with zoomFactor set correctly", async () => {
        await render(ZoomSliderComponent)
        expect(screen.getByTitle("Zoom slider")).toBeTruthy()

        const component = TestBed.createComponent(ZoomSliderComponent).componentInstance
        expect(component.zoomFactor).toBe(initialZoomFactor * 100)
    })

    it("should dispatch zoomIn action on zoom in button click", async () => {
        await render(ZoomSliderComponent)

        const zoomInButton = screen.getByTitle("Zoom in")
        await userEvent.click(zoomInButton)

        expect(store.dispatch).toHaveBeenCalledWith(zoomIn())
    })

    it("should dispatch zoomOut action on zoom out button click", async () => {
        await render(ZoomSliderComponent)

        const zoomOutButton = screen.getByTitle("Zoom out")
        await userEvent.click(zoomOutButton)

        expect(store.dispatch).toHaveBeenCalledWith(zoomOut())
    })

    it("should dispatch setCameraZoomFactor action on input change", async () => {
        await render(ZoomSliderComponent)

        const zoomSlider = screen.getByTitle("Zoom slider")
        await userEvent.type(zoomSlider, "150")

        expect(store.dispatch).toHaveBeenCalledWith(setCameraZoomFactor({ value: 1.5 }))
    })
})
