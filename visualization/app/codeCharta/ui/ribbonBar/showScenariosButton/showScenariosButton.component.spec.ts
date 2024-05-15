import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { ScenarioService } from "./scenario.service"
import { ShowScenariosButtonComponent } from "./showScenariosButton.component"
import { ShowScenariosButtonModule } from "./showScenariosButton.module"

describe("showScenariosButtonComponent", () => {
    it("should open scenarios menu and load scenarios lazily, meaning only when menu was opened", async () => {
        const mockedScenarioService = { getScenarios: jest.fn() }
        await render(ShowScenariosButtonComponent, {
            excludeComponentDeclaration: true,
            imports: [ShowScenariosButtonModule],
            componentProviders: [{ provide: ScenarioService, useValue: mockedScenarioService }]
        })
        expect(mockedScenarioService.getScenarios).not.toHaveBeenCalled()
        expect(screen.queryByText("Metric Scenarios")).toBe(null)

        await userEvent.click(screen.getByTitle("Open the scenario list"))
        expect(mockedScenarioService.getScenarios).toHaveBeenCalled()
        expect(screen.getByText("Metric Scenarios")).toBeTruthy()
    })
})
