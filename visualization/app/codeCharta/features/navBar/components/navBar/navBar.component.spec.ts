import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { render } from "@testing-library/angular"
import { isDeltaStateSelector } from "../../../../state/selectors/isDeltaState.selector"
import { defaultState } from "../../../../state/store/state.manager"
import { UploadFilesService } from "../../services/uploadFiles.service"
import { NavBarComponent } from "./navBar.component"

describe("NavBarComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NavBarComponent],
            providers: [
                provideMockStore({ initialState: defaultState }),
                { provide: State, useValue: { getValue: () => defaultState } },
                { provide: UploadFilesService, useValue: { uploadFiles: jest.fn() } }
            ]
        })
    })

    it("should render the map selector and the four other navbar widgets in standard mode", async () => {
        // Arrange & Act
        const { container } = await render(NavBarComponent, {
            providers: [
                provideMockStore({ initialState: defaultState, selectors: [{ selector: isDeltaStateSelector, value: false }] }),
                { provide: State, useValue: { getValue: () => defaultState } },
                { provide: UploadFilesService, useValue: { uploadFiles: jest.fn() } }
            ]
        })

        // Assert
        expect(container.querySelectorAll("cc-nav-bar-logo").length).toBe(1)
        expect(container.querySelectorAll("cc-nav-bar-folder-button").length).toBe(1)
        expect(container.querySelectorAll("cc-map-selector").length).toBe(1)
        expect(container.querySelectorAll("cc-delta-selector").length).toBe(0)
        expect(container.querySelectorAll("cc-mode-toggle").length).toBe(1)
        expect(container.querySelectorAll("cc-print-3d-button").length).toBe(1)
        expect(container.querySelectorAll("cc-settings-button").length).toBe(1)
    })

    it("should render the delta selector instead of the map selector in compare mode", async () => {
        // Arrange & Act
        const { container } = await render(NavBarComponent, {
            providers: [
                provideMockStore({ initialState: defaultState, selectors: [{ selector: isDeltaStateSelector, value: true }] }),
                { provide: State, useValue: { getValue: () => defaultState } },
                { provide: UploadFilesService, useValue: { uploadFiles: jest.fn() } }
            ]
        })

        // Assert
        expect(container.querySelectorAll("cc-map-selector").length).toBe(0)
        expect(container.querySelectorAll("cc-delta-selector").length).toBe(1)
    })
})
