import { TestBed } from "@angular/core/testing"
import { Store, StoreModule } from "@ngrx/store"
import { fireEvent, render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { BehaviorSubject } from "rxjs"
import { CcState } from "../../../../model/codeCharta.model"
import { ThreeMapControlsService } from "../../../../renderer/threeViewer/threeViewer.facade"
import { centerMapZoomSelector } from "../../../../stores/preferences/preferences.read.facade"
import { setCenterMapZoom } from "../../../../stores/preferences/preferences.write.facade"
import { appReducers, setStateMiddleware } from "../../../../stores/rootStore/store"
import { CenterMapZoomMenuComponent } from "./centerMapZoomMenu.component"

describe("CenterMapZoomMenuComponent", () => {
    const zoomPercentage$ = new BehaviorSubject(100)
    const threeMapControlsService = { MIN_ZOOM: 10, MAX_ZOOM: 200, zoomPercentage$, setZoomPercentage: jest.fn() }

    beforeEach(() => {
        zoomPercentage$.next(100)
        threeMapControlsService.setZoomPercentage = jest.fn()
        TestBed.configureTestingModule({
            imports: [StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })],
            providers: [{ provide: ThreeMapControlsService, useValue: threeMapControlsService }]
        })
    })

    async function renderMenu() {
        await render(CenterMapZoomMenuComponent, { componentInputs: { anchor: { x: 0, y: 0 } } })
        return TestBed.inject<Store<CcState>>(Store)
    }

    function storedCenterMapZoom(store: Store<CcState>): number {
        let storedZoom: number
        store.select(centerMapZoomSelector).subscribe(zoom => (storedZoom = zoom))
        return storedZoom
    }

    it("should store and preview the zoom picked in the menu", async () => {
        // Arrange
        const store = await renderMenu()
        const [, numberInput] = screen.getAllByLabelText("Center map zoom in percent")

        // Act
        fireEvent.input(numberInput, { target: { value: "165" } })
        fireEvent.change(numberInput, { target: { value: "165" } })

        // Assert
        expect(storedCenterMapZoom(store)).toBe(165)
        expect(threeMapControlsService.setZoomPercentage).toHaveBeenCalledWith(165)
    })

    it("should take the zoom the map currently shows", async () => {
        // Arrange
        zoomPercentage$.next(163.4)
        const store = await renderMenu()

        // Act
        await userEvent.click(screen.getByText("Use current zoom"))

        // Assert
        expect(storedCenterMapZoom(store)).toBe(163)
    })

    it("should reset to the default zoom", async () => {
        // Arrange
        const store = await renderMenu()
        store.dispatch(setCenterMapZoom({ value: 165 }))

        // Act
        await userEvent.click(screen.getByText("Reset"))

        // Assert
        expect(storedCenterMapZoom(store)).toBe(140)
        expect(threeMapControlsService.setZoomPercentage).toHaveBeenCalledWith(140)
    })
})
