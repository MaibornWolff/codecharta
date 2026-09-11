import { TestBed } from "@angular/core/testing"
import { render } from "@testing-library/angular"
import { BehaviorSubject } from "rxjs"
import { LoadingFileProgressSpinnerService } from "../../services/loadingFileProgressSpinner.service"
import { LoadingFileProgressSpinnerComponent } from "./loadingFileProgressSpinner.component"

const FADE_IN_CLASS = "animate-fade-in-delayed"

describe("LoadingFileProgressSpinnerComponent", () => {
    let isLoading$: BehaviorSubject<boolean>

    beforeEach(() => {
        isLoading$ = new BehaviorSubject(false)
        TestBed.configureTestingModule({
            providers: [{ provide: LoadingFileProgressSpinnerService, useValue: { isLoading$: () => isLoading$ } }]
        })
    })

    async function renderOverlay() {
        const { container } = await render(LoadingFileProgressSpinnerComponent, { componentInputs: { view: "metrics" } })
        return container.querySelector<HTMLElement>("#loading-gif-file")
    }

    it("should fade the overlay in when loading", async () => {
        // Arrange
        isLoading$.next(true)

        // Act
        const overlay = await renderOverlay()

        // Assert
        expect(overlay.style.visibility).toBe("visible")
        expect(overlay.classList).toContain(FADE_IN_CLASS)
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
})
