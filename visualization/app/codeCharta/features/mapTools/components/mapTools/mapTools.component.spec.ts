import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { fireEvent, render, screen } from "@testing-library/angular"
import { BehaviorSubject, of } from "rxjs"
import { ThreeMapControlsService } from "../../../../renderer/threeViewer/threeViewer.facade"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { GlobalSettingsFacade } from "../../../globalSettings/facade"
import { ScreenshotService } from "../../../screenshot/facade"
import { MapToolsComponent } from "./mapTools.component"

describe("MapToolsComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MapToolsComponent],
            providers: [
                provideMockStore({ initialState: defaultState }),
                { provide: State, useValue: { getValue: () => defaultState } },
                {
                    provide: ThreeMapControlsService,
                    useValue: {
                        autoFitTo: jest.fn(),
                        setZoomPercentage: jest.fn(),
                        MIN_ZOOM: 10,
                        MAX_ZOOM: 200,
                        zoomPercentage$: new BehaviorSubject(100)
                    }
                },
                { provide: GlobalSettingsFacade, useValue: { screenshotToClipboardEnabled$: () => of(false) } },
                {
                    provide: ScreenshotService,
                    useValue: {
                        makeScreenshotToFile: jest.fn(),
                        makeScreenshotToClipboard: jest.fn(),
                        isWriteToClipboardAllowed: true,
                        subject: "map",
                        isCaptureAvailable: () => true
                    }
                }
            ]
        })
    })

    it("should offer centering, the flashlight and a screenshot, in that order", async () => {
        // Arrange & Act
        const { container } = await render(MapToolsComponent)

        // Assert
        const labels = [...container.querySelectorAll("button")].map(button => button.getAttribute("aria-label"))
        expect(labels).toEqual(["Center map", "Flashlight", "Screenshot"])
    })

    it("should open the zoom menu on right click of the center map tool", async () => {
        // Arrange
        const { container } = await render(MapToolsComponent)

        // Act
        fireEvent.contextMenu(screen.getByRole("button", { name: "Center map" }))

        // Assert
        expect(container.querySelector("cc-center-map-zoom-menu")).not.toBeNull()
    })
})
