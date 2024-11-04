import { TestBed } from "@angular/core/testing"
import { fireEvent, render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { ZoomSliderComponent } from "./zoomSlider.component"
import { ThreeMapControlsService } from "../../codeMap/threeViewer/threeMapControls.service"
import { BehaviorSubject } from "rxjs"

describe("ZoomSliderComponent", () => {
    const mockedThreeMapControlsService = {
        MAX_ZOOM: 200,
        MIN_ZOOM: 10,
        zoomPercentage$: new BehaviorSubject(100),
        setZoomPercentage: jest.fn()
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ZoomSliderComponent],
            providers: [{ provide: ThreeMapControlsService, useValue: mockedThreeMapControlsService }]
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it("should subscribe to the zoom observable and set min max properties", async () => {
        jest.spyOn(mockedThreeMapControlsService.zoomPercentage$, "subscribe")
        const { fixture } = await render(ZoomSliderComponent)
        const zoomSliderComponent = fixture.componentInstance

        expect(zoomSliderComponent.maxZoom).toBe(200)
        expect(zoomSliderComponent.minZoom).toBe(10)
        expect(mockedThreeMapControlsService.zoomPercentage$.subscribe).toHaveBeenCalled()
        expect(zoomSliderComponent.zoomPercentage).toBe(100)
    })

    it("should call setZoomPercentage on input change", async () => {
        await render(ZoomSliderComponent)

        const slider = screen.getByTestId("zoomRange")

        fireEvent.input(slider, { target: { value: "80" } })

        expect(mockedThreeMapControlsService.setZoomPercentage).toHaveBeenCalledWith(80)
    })

    it("should increase the zoom percentage when zoomIn is called", async () => {
        mockedThreeMapControlsService.zoomPercentage$.next(100)
        const { fixture } = await render(ZoomSliderComponent)
        fixture.detectChanges()

        await userEvent.click(screen.getByTestId("zoomIn"))

        expect(mockedThreeMapControlsService.setZoomPercentage).toHaveBeenCalledWith(110)
    })

    it("should decrease the zoom percentage when zoomOut is called", async () => {
        mockedThreeMapControlsService.zoomPercentage$.next(100)
        const { fixture } = await render(ZoomSliderComponent)
        fixture.detectChanges()

        await userEvent.click(screen.getByTestId("zoomOut"))

        expect(mockedThreeMapControlsService.setZoomPercentage).toHaveBeenCalledWith(90)
    })

    it("should not exceed the maximum zoom", async () => {
        mockedThreeMapControlsService.zoomPercentage$.next(200)
        const { fixture } = await render(ZoomSliderComponent)
        fixture.detectChanges()

        await userEvent.click(screen.getByTestId("zoomIn"))

        expect(mockedThreeMapControlsService.setZoomPercentage).toHaveBeenCalledWith(200)
    })

    it("should not go below the minimum zoom", async () => {
        mockedThreeMapControlsService.zoomPercentage$.next(10)
        const { fixture } = await render(ZoomSliderComponent)
        fixture.detectChanges()

        await userEvent.click(screen.getByTestId("zoomOut"))

        expect(mockedThreeMapControlsService.setZoomPercentage).toHaveBeenCalledWith(10)
    })
})
