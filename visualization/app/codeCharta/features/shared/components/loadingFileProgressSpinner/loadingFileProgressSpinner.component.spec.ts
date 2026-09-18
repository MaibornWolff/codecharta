import { TestBed } from "@angular/core/testing"
import { render } from "@testing-library/angular"
import { BehaviorSubject } from "rxjs"
import { LoadingFileProgressSpinnerService } from "../../services/loadingFileProgressSpinner.service"
import { LoadingFileProgressSpinnerComponent } from "./loadingFileProgressSpinner.component"

const FADE_IN_CLASS = "animate-fade-in-delayed"

describe("LoadingFileProgressSpinnerComponent", () => {
    let isLoading$: BehaviorSubject<boolean>
    let phase$: BehaviorSubject<string | null>

    beforeEach(() => {
        isLoading$ = new BehaviorSubject(false)
        phase$ = new BehaviorSubject<string | null>(null)
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: LoadingFileProgressSpinnerService,
                    useValue: { isLoading$: () => isLoading$, phase$: () => phase$ }
                }
            ]
        })
    })

    async function renderSpinner() {
        return render(LoadingFileProgressSpinnerComponent, { componentInputs: { view: "metrics" } })
    }

    async function renderOverlay() {
        return (await renderSpinner()).container.querySelector<HTMLElement>("#loading-gif-file")
    }

    async function renderPhaseText() {
        return (await renderSpinner()).container.querySelector<HTMLElement>('[data-testid="loading-phase"]')
    }

    it("should fade the overlay in when a load starts while it is on screen", async () => {
        // Arrange
        const { container, detectChanges } = await renderSpinner()

        // Act
        isLoading$.next(true)
        detectChanges()

        // Assert
        const overlay = container.querySelector<HTMLElement>("#loading-gif-file")
        expect(overlay.style.visibility).toBe("visible")
        expect(overlay.classList).toContain(FADE_IN_CLASS)
    })

    it("should appear at once when it is mounted into a load already under way", async () => {
        // Arrange — the boot indicator hands over mid-load; a delayed fade would show what is behind
        isLoading$.next(true)

        // Act
        const overlay = await renderOverlay()

        // Assert
        expect(overlay.style.visibility).toBe("visible")
        expect(overlay.classList).not.toContain(FADE_IN_CLASS)
    })

    it("should hide the overlay without a fade when not loading", async () => {
        // Arrange
        isLoading$.next(false)

        // Act
        const overlay = await renderOverlay()

        // Assert
        expect(overlay.style.visibility).toBe("hidden")
        expect(overlay.classList).not.toContain(FADE_IN_CLASS)
    })

    it("should say what the spinner is waiting for", async () => {
        // Arrange
        isLoading$.next(true)
        phase$.next("Saving your session")

        // Act
        const phaseText = await renderPhaseText()

        // Assert
        expect(phaseText.textContent.trim()).toBe("Saving your session")
    })

    it("should say nothing while there is no phase to name", async () => {
        // Arrange
        isLoading$.next(true)
        phase$.next(null)

        // Act
        const phaseText = await renderPhaseText()

        // Assert
        expect(phaseText).toBeNull()
    })
})
