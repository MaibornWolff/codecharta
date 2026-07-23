import { TestBed } from "@angular/core/testing"
import { provideRouter } from "@angular/router"
import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { render } from "@testing-library/angular"
import { of } from "rxjs"
import { ActiveViewStore } from "../../../../routing/activeView.store"
import { ViewId } from "../../../../routing/routePaths"
import { isDeltaStateSelector } from "../../../../stores/fileStore/store/isDeltaState.selector"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { UploadFilesService } from "../../services/uploadFiles.service"
import { NavBarComponent } from "./navBar.component"

describe("NavBarComponent", () => {
    const TRAILING_DIVIDER_SELECTOR = ".navbar-end > cc-nav-divider"

    const providersFor = (isDeltaState: boolean, activeView: ViewId = "metrics") => [
        provideMockStore({ initialState: defaultState, selectors: [{ selector: isDeltaStateSelector, value: isDeltaState }] }),
        { provide: State, useValue: { getValue: () => defaultState } },
        { provide: UploadFilesService, useValue: { uploadFiles: jest.fn() } },
        { provide: ActiveViewStore, useValue: { activeView$: of(activeView), currentView: () => activeView } },
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
        expect(container.querySelectorAll(TRAILING_DIVIDER_SELECTOR).length).toBe(2)
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

    it("should render only the settings button on the domain view", async () => {
        // Arrange & Act
        const { container } = await render(NavBarComponent, { providers: providersFor(false, "domain") })

        // Assert — 3D print exports the code map's geometry and the mode toggle drives delta mode,
        expect(container.querySelectorAll("cc-mode-toggle").length).toBe(0)
        expect(container.querySelectorAll("cc-print-3d-button").length).toBe(0)
        expect(container.querySelectorAll("cc-settings-button").length).toBe(1)
    })

    it("should leave no stray divider on the domain view", async () => {
        // Arrange & Act
        const { container } = await render(NavBarComponent, { providers: providersFor(false, "domain") })

        // Assert — a divider is the trailing separator of the control before it, so hiding both
        expect(container.querySelectorAll(TRAILING_DIVIDER_SELECTOR).length).toBe(0)
    })

    it("should publish its own height as the shared bars-height variable", async () => {
        // Arrange & Act
        await render(NavBarComponent, { providers: providersFor(false) })

        // Assert — views that never mount the code map depend on this being set by the measured element
        expect(document.documentElement.style.getPropertyValue("--cc-bars-height")).toMatch(/^\d+px$/)
    })
})
