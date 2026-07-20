import { TestBed } from "@angular/core/testing"
import { provideRouter } from "@angular/router"
import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { render } from "@testing-library/angular"
import { isDeltaStateSelector } from "../../../../stores/fileStore/store/isDeltaState.selector"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { UploadFilesService } from "../../services/uploadFiles.service"
import { NavBarComponent } from "./navBar.component"

describe("NavBarComponent", () => {
    const providersFor = (isDeltaState: boolean) => [
        provideMockStore({ initialState: defaultState, selectors: [{ selector: isDeltaStateSelector, value: isDeltaState }] }),
        { provide: State, useValue: { getValue: () => defaultState } },
        { provide: UploadFilesService, useValue: { uploadFiles: jest.fn() } },
        // The view switcher renders routerLinks, which need a router even when no route is exercised.
        provideRouter([])
    ]

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NavBarComponent],
            providers: providersFor(false)
        })
    })

    it("should render the map selector and the four other navbar widgets in standard mode", async () => {
        // Arrange & Act
        const { container } = await render(NavBarComponent, { providers: providersFor(false) })

        // Assert
        expect(container.querySelectorAll("cc-nav-bar-logo").length).toBe(1)
        expect(container.querySelectorAll("cc-nav-bar-folder-button").length).toBe(1)
        expect(container.querySelectorAll("cc-map-selector").length).toBe(1)
        expect(container.querySelectorAll("cc-delta-selector").length).toBe(0)
        expect(container.querySelectorAll("cc-mode-toggle").length).toBe(1)
        expect(container.querySelectorAll("cc-print-3d-button").length).toBe(1)
        expect(container.querySelectorAll("cc-settings-button").length).toBe(1)
        expect(container.querySelectorAll("cc-view-switcher").length).toBe(1)
    })

    it("should render the delta selector instead of the map selector in compare mode", async () => {
        // Arrange & Act
        const { container } = await render(NavBarComponent, { providers: providersFor(true) })

        // Assert
        expect(container.querySelectorAll("cc-map-selector").length).toBe(0)
        expect(container.querySelectorAll("cc-delta-selector").length).toBe(1)
    })

    it("should hide the view switcher in compare mode", async () => {
        // Arrange & Act
        const { container } = await render(NavBarComponent, { providers: providersFor(true) })

        // Assert — the domain view merges both compared files into one cloud, so it has no delta meaning
        expect(container.querySelectorAll("cc-view-switcher").length).toBe(0)
    })

    it("should publish its own height as the shared bars-height variable", async () => {
        // Arrange & Act
        await render(NavBarComponent, { providers: providersFor(false) })

        // Assert — views that never mount the code map depend on this being set by the measured element
        expect(document.documentElement.style.getPropertyValue("--cc-bars-height")).toMatch(/^\d+px$/)
    })
})
