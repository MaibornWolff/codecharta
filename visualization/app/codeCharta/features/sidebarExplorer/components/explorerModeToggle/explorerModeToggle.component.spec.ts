import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { ExplorerMode, FILES_EXPLORER_MODE } from "../../explorerModes"
import { provideExplorerPortsMock } from "../../explorerPorts.mocks"
import { ExplorerModeService } from "../../services/explorerMode.service"
import { ExplorerModeToggleComponent } from "./explorerModeToggle.component"

const WORDS_MODE: ExplorerMode = {
    id: "words",
    label: "Words",
    icon: "fa-solid fa-font",
    searchPlaceholder: "payment",
    searchAriaLabel: "Search words"
}

describe("ExplorerModeToggleComponent", () => {
    const setup = async () => {
        TestBed.resetTestingModule()
        localStorage.clear()
        TestBed.configureTestingModule({
            imports: [ExplorerModeToggleComponent],
            providers: [...provideExplorerPortsMock({ capabilities: { modes: [FILES_EXPLORER_MODE, WORDS_MODE] } })]
        })
        const rendered = await render(ExplorerModeToggleComponent)
        return { ...rendered, modeService: TestBed.inject(ExplorerModeService) }
    }

    it("should offer a button per mode, marking the active one", async () => {
        // Arrange & Act
        await setup()

        // Assert
        expect(screen.getByTestId("explorer-mode-files").getAttribute("aria-pressed")).toBe("true")
        expect(screen.getByTestId("explorer-mode-words").getAttribute("aria-pressed")).toBe("false")
    })

    it("should activate the clicked mode", async () => {
        // Arrange
        const { modeService, detectChanges } = await setup()

        // Act
        await userEvent.click(screen.getByTestId("explorer-mode-words"))
        detectChanges()

        // Assert
        expect(modeService.activeMode()).toBe(WORDS_MODE)
        expect(screen.getByTestId("explorer-mode-words").getAttribute("aria-pressed")).toBe("true")
    })
})
