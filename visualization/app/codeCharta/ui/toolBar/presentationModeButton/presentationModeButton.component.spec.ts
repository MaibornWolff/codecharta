import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { State } from "../../../state/angular-redux/state"
import { isPresentationModeSelector } from "../../../state/store/appSettings/isPresentationMode/isPresentationMode.selector"
import { PresentationModeButtonComponent } from "./presentationModeButton.component"
import { PresentationModeButtonModule } from "./presentationModeButton.module"

describe("presentationModeButtonComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [PresentationModeButtonModule]
		})
	})

	it("should toggle presentation mode", async () => {
		const { debug } = await render(PresentationModeButtonComponent, {
			excludeComponentDeclaration: true
		})
		const state = TestBed.inject(State)
		const initialPresentationMode = isPresentationModeSelector(state.getValue())
		debug()

		userEvent.click(screen.getByTitle("Enable presentation mode"))
		const togglePresentationMode = isPresentationModeSelector(state.getValue())

		expect(initialPresentationMode).toBe(!togglePresentationMode)

		// expect(screen.getByRole("button")).toBeTruthy()
	})
})
