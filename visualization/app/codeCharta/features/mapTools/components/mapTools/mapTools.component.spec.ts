import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { fireEvent, render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { BehaviorSubject, of } from "rxjs"
import { ThreeMapControlsService } from "../../../../renderer/threeViewer/threeViewer.facade"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { currentFocusedNodePathSelector } from "../../../../stores/sharedView/sharedView.read.facade"
import { unfocusAllNodes } from "../../../../stores/sharedView/sharedView.write.facade"
import { GlobalSettingsFacade } from "../../../globalSettings/facade"
import { ScreenshotService } from "../../../screenshot/facade"
import { MapToolsComponent } from "./mapTools.component"

describe("MapToolsComponent", () => {
    function isUnfocusRevealed(): boolean {
        return !screen.getByTestId("metrics-bar-unfocus").closest("cc-bar-tool").hasAttribute("inert")
    }

    function focusOn(path: string | undefined) {
        const store = TestBed.inject(MockStore)
        store.overrideSelector(currentFocusedNodePathSelector, path)
        store.refreshState()
    }

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

    it("should offer unfocus, centering, the flashlight and a screenshot, in that order", async () => {
        // Arrange & Act
        const { container } = await render(MapToolsComponent)

        // Assert
        const labels = [...container.querySelectorAll("button")].map(button => button.getAttribute("aria-label"))
        expect(labels).toEqual(["Unfocus", "Center map", "Flashlight", "Screenshot"])
    })

    it("should open the zoom menu on right click of the center map tool", async () => {
        // Arrange
        const { container } = await render(MapToolsComponent)

        // Act
        fireEvent.contextMenu(screen.getByRole("button", { name: "Center map" }))

        // Assert
        expect(container.querySelector("cc-center-map-zoom-menu")).not.toBeNull()
    })

    it("should keep unfocus hidden while nothing is focused", async () => {
        // Act
        await render(MapToolsComponent)

        // Assert
        expect(isUnfocusRevealed()).toBe(false)
    })

    it("should reveal unfocus while a folder is focused, and show the whole map again", async () => {
        // Arrange
        const { fixture } = await render(MapToolsComponent)
        focusOn("/root/sample1.cc.json")
        fixture.detectChanges()
        const dispatch = jest.spyOn(TestBed.inject(MockStore), "dispatch")

        // Act
        await userEvent.click(screen.getByTestId("metrics-bar-unfocus"))

        // Assert
        expect(isUnfocusRevealed()).toBe(true)
        expect(dispatch).toHaveBeenCalledWith(unfocusAllNodes())
    })
})
