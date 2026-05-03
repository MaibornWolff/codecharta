import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { setPresentationMode } from "../../../../state/store/appSettings/isPresentationMode/isPresentationMode.actions"
import { isPresentationModeSelector } from "../../../../state/store/appSettings/isPresentationMode/isPresentationMode.selector"
import { PresentationModeButtonComponent } from "./presentationModeButton.component"

describe("PresentationModeButtonComponent (toolbox)", () => {
    function configure(initialPresentationMode: boolean) {
        TestBed.configureTestingModule({
            imports: [PresentationModeButtonComponent],
            providers: [provideMockStore({ selectors: [{ selector: isPresentationModeSelector, value: initialPresentationMode }] })]
        })
    }

    it("should not have btn-active when presentation mode is off", async () => {
        // Arrange
        configure(false)

        // Act
        await render(PresentationModeButtonComponent)
        const button = screen.getByRole("button", { name: "Presentation mode" })

        // Assert
        expect(button.classList.contains("btn-active")).toBe(false)
        expect(button.getAttribute("title")).toBe("Enable flashlight hover effect")
    })

    it("should have btn-active when presentation mode is on", async () => {
        // Arrange
        configure(true)

        // Act
        await render(PresentationModeButtonComponent)
        const button = screen.getByRole("button", { name: "Presentation mode" })

        // Assert
        expect(button.classList.contains("btn-active")).toBe(true)
        expect(button.getAttribute("title")).toBe("Disable flashlight hover effect")
    })

    it("should dispatch setPresentationMode with the toggled value on click", async () => {
        // Arrange
        configure(false)
        await render(PresentationModeButtonComponent)
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")

        // Act
        await userEvent.click(screen.getByRole("button", { name: "Presentation mode" }))

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setPresentationMode({ value: true }))
    })
})
