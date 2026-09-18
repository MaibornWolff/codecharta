import { render } from "@testing-library/angular"
import { clearLoadPhase, setLoadPhase } from "../../../../util/busy/loadPhase"
import { BootLoadingIndicatorComponent } from "./bootLoadingIndicator.component"

describe("BootLoadingIndicatorComponent", () => {
    afterEach(() => {
        // the phase is a module singleton, so a test that sets it must hand it back empty
        clearLoadPhase()
    })

    async function renderPhaseText() {
        const { container } = await render(BootLoadingIndicatorComponent)
        return container.querySelector<HTMLElement>('[data-testid="boot-loading-phase"]')
    }

    it("should say what the boot is waiting for", async () => {
        // Arrange
        setLoadPhase("Restoring your session")

        // Act
        const phaseText = await renderPhaseText()

        // Assert
        expect(phaseText.textContent).toBe("Restoring your session")
    })

    it("should say nothing while the boot has not named a phase", async () => {
        // Arrange
        clearLoadPhase()

        // Act
        const phaseText = await renderPhaseText()

        // Assert
        expect(phaseText).toBeNull()
    })

    it("should cover the whole application", async () => {
        // Arrange — the shell does not exist yet, so nothing else is on screen to be covered up
        const { container } = await render(BootLoadingIndicatorComponent)

        // Act
        const overlay = container.querySelector<HTMLElement>("#boot-loading-indicator")

        // Assert
        expect(overlay.classList).toContain("fixed")
        expect(overlay.classList).toContain("inset-0")
    })
})
