import { signal, WritableSignal } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { EXPLORER_CONDITIONAL_MODES } from "../explorerCapabilities"
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

    describe("with conditional modes", () => {
        const setupConditional = (conditionalModes: WritableSignal<ExplorerMode[]>) => {
            TestBed.resetTestingModule()
            TestBed.configureTestingModule({
                providers: [
                    provideExplorerCapabilitiesMock({ modes: [FILES_EXPLORER_MODE] }),
                    { provide: EXPLORER_CONDITIONAL_MODES, useValue: conditionalModes },
                    ExplorerModeService
                ]
            })
            return TestBed.inject(ExplorerModeService)
        }

        it("should offer a conditional mode only while it is there", () => {
            // Arrange
            const conditionalModes = signal<ExplorerMode[]>([])
            const modeService = setupConditional(conditionalModes)

            // Act
            modeService.activate(WORDS_MODE.id)
            const activeBeforeItIsThere = modeService.activeMode()
            conditionalModes.set([WORDS_MODE])

            // Assert
            expect(activeBeforeItIsThere).toBe(FILES_EXPLORER_MODE)
            expect(modeService.modes()).toEqual([FILES_EXPLORER_MODE, WORDS_MODE])
        })

        it("should hand over to the opening mode when the open conditional mode goes away", () => {
            // Arrange
            const conditionalModes = signal<ExplorerMode[]>([WORDS_MODE])
            const modeService = setupConditional(conditionalModes)
            modeService.activate(WORDS_MODE.id)

            // Act
            conditionalModes.set([])

            // Assert
            expect(modeService.activeMode()).toBe(FILES_EXPLORER_MODE)
            expect(modeService.isFilesMode()).toBe(true)
        })

        it("should tell whether the open mode shows the list tools", () => {
            // Arrange
            const conditionalModes = signal<ExplorerMode[]>([{ ...WORDS_MODE, hidesListTools: true }])
            const modeService = setupConditional(conditionalModes)

            // Act
            const inFilesMode = modeService.showsListTools()
            modeService.activate(WORDS_MODE.id)
            const inHidingMode = modeService.showsListTools()

            // Assert
            expect(inFilesMode).toBe(true)
            expect(inHidingMode).toBe(false)
        })
    })
})
