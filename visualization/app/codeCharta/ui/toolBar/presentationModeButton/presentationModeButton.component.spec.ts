import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { PresentationModeButtonComponent } from "./presentationModeButton.component"
import { PresentationModeButtonModule } from "./presentationModeButton.module"

describe("presentationModeButtonComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [PresentationModeButtonModule]
		})
	})

	it("should toggle presentation mode", async () => {
		const { container } = await render(PresentationModeButtonComponent, { excludeComponentDeclaration: true })
		expect(screen.getByTitle("Enable flashlight hover effect")).toBeTruthy()

		await userEvent.click(container.querySelector("mat-slide-toggle label"))
		expect(screen.getByTitle("Disable flashlight hover effect")).toBeTruthy()
	})
})
