import { TestBed } from "@angular/core/testing"
import { MatDialog } from "@angular/material/dialog"
import { getByText, getByTitle, render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { SCENARIO_ITEMS } from "../../../../util/dataMocks"
import { AddCustomScenarioDialogComponent } from "../addCustomScenarioDialog/addCustomScenarioDialog.component"
import { ScenarioService } from "../scenario.service"
import { ShowScenariosButtonModule } from "../showScenariosButton.module"
import { ScenariosComponent } from "./scenarios.component"

describe("scenariosComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ShowScenariosButtonModule],
            providers: [
                {
                    provide: ScenarioService,
                    useValue: {
                        applyScenario: jest.fn(),
                        removeScenario: jest.fn()
                    }
                },
                { provide: MatDialog, useValue: { open: jest.fn() } }
            ]
        })
    })

    it("should let a user open the dialog for creating a custom scenario", async () => {
        await render(ScenariosComponent, { excludeComponentDeclaration: true })
        const dialog = TestBed.inject(MatDialog)

        await userEvent.click(screen.getByTitle("Create a custom scenario"))

        expect(dialog.open).toHaveBeenCalledWith(AddCustomScenarioDialogComponent, { panelClass: "cc-add-custom-scenario" })
    })

    it("should render scenarios correctly", async () => {
        const { container } = await render(ScenariosComponent, {
            excludeComponentDeclaration: true,
            componentProperties: { scenarios: SCENARIO_ITEMS }
        })
        const scenarioRows = container.querySelectorAll<HTMLElement>(".cc-row")

        expect(getByText(scenarioRows[1], "Scenario")["disabled"]).toBe(false)
        const savedPropertyOfFirstScenario = getByTitle(scenarioRows[1], "random")
        expect(savedPropertyOfFirstScenario.querySelector("i").className).toBe("fa fa-random")

        expect(getByText(scenarioRows[2], "Scenario2")["disabled"]).toBe(true)
        const savedPropertyOfSecondScenario = getByTitle(scenarioRows[2], "some")
        expect(savedPropertyOfSecondScenario.querySelector("i").className).toBe("fa fa-some cc-is-saved")
    })

    it("should register event handlers correctly", async () => {
        const { container } = await render(ScenariosComponent, {
            excludeComponentDeclaration: true,
            componentProperties: { scenarios: SCENARIO_ITEMS }
        })
        const scenarioService = TestBed.inject(ScenarioService)
        const scenarioRows = container.querySelectorAll<HTMLElement>(".cc-row")

        await userEvent.click(getByText(scenarioRows[1], "Scenario"))
        expect(scenarioService.applyScenario).toHaveBeenCalledWith("Scenario")

        await userEvent.click(getByTitle(scenarioRows[1], "Remove custom scenario"))
        expect(scenarioService.removeScenario).toHaveBeenCalledWith("Scenario")
    })
})
