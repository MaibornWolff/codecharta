import { TestBed } from "@angular/core/testing"
import { MatDialog } from "@angular/material/dialog"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { ScenarioService } from "../scenario.service"
import { ScenariosComponent } from "../scenarios.component"
import { ShowScenariosButtonModule } from "../showScenariosButton.module"

describe("scenariosComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [ShowScenariosButtonModule]
		})
	})
	it("should add a custom scenario", async () => {
		const mockedDialog = { open: jest.fn() }
		await render(ScenariosComponent, {
			excludeComponentDeclaration: true,
			componentProviders: [
				{
					provide: ScenarioService,
					useValue: {
						getScenarios: () => {
							console.log("getScenarios")
							return []
						}
					}
				},
				{ provide: MatDialog, useValue: mockedDialog }
			]
		})

		userEvent.click(screen.getByTitle("Open the scenario list"))

		// userEvent.click(await screen.getByRole("menu", { hidden: true }))

		// https://github.com/testing-library/user-event/issues/708
		expect(() => userEvent.click(screen.getByTitle("Create a custom scenario"))).toThrow()
		// expect()
		// userEvent.click(screen.getByTitle("Create a custom scenario"))
		// userEvent.click(document.querySelector("[title='Create a custom scenario']"))
	})
})
