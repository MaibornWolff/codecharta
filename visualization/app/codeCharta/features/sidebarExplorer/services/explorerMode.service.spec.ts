import { TestBed } from "@angular/core/testing"
import { ExplorerMode, FILES_EXPLORER_MODE } from "../explorerModes"
import { provideExplorerCapabilitiesMock } from "../explorerPorts.mocks"
import { ExplorerModeService } from "./explorerMode.service"

const WORDS_MODE: ExplorerMode = {
    id: "words",
    label: "Words",
    icon: "fa-solid fa-font",
    searchPlaceholder: "payment",
    searchAriaLabel: "Search words"
}

describe("ExplorerModeService", () => {
    const setup = (modes: ExplorerMode[] = [FILES_EXPLORER_MODE, WORDS_MODE]) => {
        TestBed.resetTestingModule()
        TestBed.configureTestingModule({ providers: [provideExplorerCapabilitiesMock({ modes }), ExplorerModeService] })
        return TestBed.inject(ExplorerModeService)
    }

    it("should open in the first mode the view offers", () => {
        // Arrange & Act
        const modeService = setup([WORDS_MODE, FILES_EXPLORER_MODE])

        // Assert
        expect(modeService.activeMode()).toBe(WORDS_MODE)
        expect(modeService.isFilesMode()).toBe(false)
    })

    it("should activate a mode the view offers", () => {
        // Arrange
        const modeService = setup()

        // Act
        modeService.activate("words")

        // Assert
        expect(modeService.activeMode()).toBe(WORDS_MODE)
        expect(modeService.isFilesMode()).toBe(false)
    })

    it("should keep the active mode when asked for one the view does not offer", () => {
        // Arrange
        const modeService = setup([FILES_EXPLORER_MODE])

        // Act
        modeService.activate("words")

        // Assert
        expect(modeService.activeMode()).toBe(FILES_EXPLORER_MODE)
    })
})
