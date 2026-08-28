import { Component, output, signal } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { provideRouter } from "@angular/router"
import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { render } from "@testing-library/angular"
import { isDeltaStateSelector } from "../../../../stores/fileStore/store/isDeltaState.selector"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { Export3DMapDialogComponent, Export3DMapDialogStore } from "../../../3dPrint/facade"
import { UploadFilesService } from "../../services/uploadFiles.service"
import { NavBarComponent } from "./navBar.component"

@Component({ selector: "cc-export-3D-map-dialog", template: "" })
class Export3DMapDialogStubComponent {
    readonly closed = output<void>()
}

describe("NavBarComponent", () => {
    const providersFor = (isDeltaState: boolean) => [
        provideMockStore({ initialState: defaultState, selectors: [{ selector: isDeltaStateSelector, value: isDeltaState }] }),
        { provide: State, useValue: { getValue: () => defaultState } },
        { provide: UploadFilesService, useValue: { uploadFiles: jest.fn() } },
        provideRouter([])
    ]

    const stubTheExportDialog = () =>
        TestBed.overrideComponent(NavBarComponent, {
            remove: { imports: [Export3DMapDialogComponent] },
            add: { imports: [Export3DMapDialogStubComponent] }
        })

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NavBarComponent],
            providers: providersFor(false)
        })
    })

    it("should render the file controls, the centered view switcher and the settings button", async () => {
        // Arrange & Act
        const { container } = await render(NavBarComponent, { providers: providersFor(false) })

        // Assert
        expect(container.querySelectorAll("cc-nav-bar-logo").length).toBe(1)
        expect(container.querySelectorAll("cc-nav-bar-folder-button").length).toBe(1)
        expect(container.querySelectorAll("cc-map-selector").length).toBe(1)
        expect(container.querySelectorAll("cc-delta-selector").length).toBe(0)
        expect(container.querySelectorAll(".navbar-center > cc-view-switcher").length).toBe(1)
        expect(container.querySelectorAll(".navbar-end > cc-settings-button").length).toBe(1)
    })

    it("should render no control other than the settings button on the trailing side", async () => {
        // Arrange & Act
        const { container } = await render(NavBarComponent, { providers: providersFor(false) })

        // Assert — the mode toggle and the 3D print action moved into the hover mode bar
        expect(container.querySelectorAll(".navbar-end > *").length).toBe(1)
        expect(container.querySelectorAll(".navbar-end cc-mode-toggle").length).toBe(0)
        expect(container.querySelectorAll(".navbar-end cc-print-3d-button").length).toBe(0)
    })

    it("should render the delta selector instead of the map selector in compare mode", async () => {
        // Arrange & Act
        const { container } = await render(NavBarComponent, { providers: providersFor(true) })

        // Assert
        expect(container.querySelectorAll("cc-map-selector").length).toBe(0)
        expect(container.querySelectorAll("cc-delta-selector").length).toBe(1)
    })

    it("should keep the view switcher in compare mode", async () => {
        // Arrange & Act
        const { container } = await render(NavBarComponent, { providers: providersFor(true) })

        // Assert — its mode bar is the only way back out of compare mode
        expect(container.querySelectorAll("cc-view-switcher").length).toBe(1)
    })

    it("should publish its own height as the shared bars-height variable", async () => {
        // Arrange & Act
        await render(NavBarComponent, { providers: providersFor(false) })

        // Assert — views that never mount the code map depend on this being set by the measured element
        expect(document.documentElement.style.getPropertyValue("--cc-bars-height")).toMatch(/^\d+px$/)
    })

    it("should host the 3D export dialog itself, so the mode bar can unmount under it", async () => {
        // Arrange — the print button lives in the hover mode bar, which disappears on mouse-out
        stubTheExportDialog()

        // Act
        const { container } = await render(NavBarComponent, {
            providers: [
                ...providersFor(false),
                { provide: Export3DMapDialogStore, useValue: { isDialogOpen: signal(true), closeDialog: jest.fn() } }
            ]
        })

        // Assert
        expect(container.querySelectorAll("cc-export-3D-map-dialog").length).toBe(1)
    })

    it("should not host the 3D export dialog while it is closed", async () => {
        // Arrange
        stubTheExportDialog()

        // Act
        const { container } = await render(NavBarComponent, {
            providers: [
                ...providersFor(false),
                { provide: Export3DMapDialogStore, useValue: { isDialogOpen: signal(false), closeDialog: jest.fn() } }
            ]
        })

        // Assert
        expect(container.querySelectorAll("cc-export-3D-map-dialog").length).toBe(0)
    })
})
