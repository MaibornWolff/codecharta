import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { fireEvent, render, screen } from "@testing-library/angular"
import { BehaviorSubject, of } from "rxjs"
import { ThreeMapControlsService } from "../../../../renderer/threeViewer/threeViewer.facade"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { GlobalSettingsFacade } from "../../../globalSettings/facade"
import { ScreenshotService } from "../../../screenshot/facade"
import { ViewCubeToolboxComponent } from "./viewCubeToolbox.component"

describe("ViewCubeToolboxComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ViewCubeToolboxComponent],
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

    it("should render one of each toolbox sub-component", async () => {
        // Arrange & Act
        const { container } = await render(ViewCubeToolboxComponent)

        // Assert
        expect(container.querySelectorAll("cc-toolbox-center-map-button").length).toBe(1)
        expect(container.querySelectorAll("cc-toolbox-screenshot-button").length).toBe(1)
        expect(container.querySelectorAll("cc-toolbox-presentation-mode-button").length).toBe(1)
    })

    it("should open the zoom menu outside the translated toolbar on right click", async () => {
        // Arrange
        const { container } = await render(ViewCubeToolboxComponent)

        // Act
        fireEvent.contextMenu(screen.getByRole("button", { name: "Center map" }))

        // Assert
        const zoomMenu = container.querySelector("cc-center-map-zoom-menu")
        expect(zoomMenu).toBeTruthy()
        // a translated ancestor becomes the containing block of the fixed menu and moves it off screen
        expect(zoomMenu.closest(".join")).toBeNull()
    })
})
