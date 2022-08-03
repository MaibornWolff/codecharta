import { TestBed } from "@angular/core/testing"
import { MatDialogRef } from "@angular/material/dialog"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { Vector3 } from "three"
import { ThreeCameraServiceToken, ThreeOrbitControlsServiceToken } from "../../../services/ajs-upgraded-providers"
import { setState } from "../../../state/store/state.actions"
import { splitStateActions } from "../../../state/store/state.splitter"
import { Store } from "../../../state/store/store"
import { SCENARIO_ATTRIBUTE_CONTENT, STATE } from "../../../util/dataMocks"
import { ScenarioHelper } from "../../../util/scenarioHelper"
import { AddCustomScenarioComponent } from "./addCustomScenario.component"
import { AddCustomScenarioModule } from "./addCustomScenario.module"

describe("AddCustomScenarioComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [AddCustomScenarioModule],
			providers: [
				{ provide: ThreeCameraServiceToken, useValue: { camera: { position: new Vector3(0, 300, 1000) } } },
				{ provide: ThreeOrbitControlsServiceToken, useValue: { controls: { target: new Vector3(177, 0, 299) } } },
				{ provide: MatDialogRef, useValue: { close: jest.fn() } }
			]
		})
	})

	it("should enable the user to add a custom scenario, with all properties set initially", async () => {
		ScenarioHelper.addScenario = jest.fn()
		for (const splittedActions of splitStateActions(setState(STATE))) {
			Store.dispatch(splittedActions)
		}
		const { container } = await render(AddCustomScenarioComponent, { excludeComponentDeclaration: true })
		const closeDialog = TestBed.inject(MatDialogRef).close

		userEvent.type(container.querySelector("input"), "my-custom-scenario")
		userEvent.click(container.querySelector("button"))

		expect(ScenarioHelper.addScenario).toHaveBeenCalled()
		expect((ScenarioHelper.addScenario as jest.Mock).mock.calls[0][0]).toBe("my-custom-scenario")
		expect((ScenarioHelper.addScenario as jest.Mock).mock.calls[0][1]).toEqual(SCENARIO_ATTRIBUTE_CONTENT)
		expect(closeDialog).toHaveBeenCalled()
	})

	it("should validate scenario's name", async () => {
		ScenarioHelper.isScenarioExisting = (name: string) => name === "I-already-exist"
		const { container } = await render(AddCustomScenarioComponent, { excludeComponentDeclaration: true })

		const scenarioNameInput = container.querySelector("input")
		userEvent.click(scenarioNameInput)
		scenarioNameInput.blur()
		expect(await screen.findByText("Scenario name is required")).toBeTruthy()

		userEvent.type(scenarioNameInput, "I-already-exist")
		expect(await screen.findByText("A Scenario with this name already exists")).toBeTruthy()

		userEvent.type(scenarioNameInput, "my-custom-scenario")
		expect(screen.queryByText("A Scenario with this name already exists")).toBeFalsy()
	})

	it("should show an error message, when no properties are selected", async () => {
		for (const splittedActions of splitStateActions(setState(STATE))) {
			Store.dispatch(splittedActions)
		}
		await render(AddCustomScenarioComponent, { excludeComponentDeclaration: true })

		userEvent.click(screen.getByText("Camera-Position"))
		userEvent.click(screen.getByText("Area-Metric (rloc)"))
		userEvent.click(screen.getByText("Height-Metric (mcc)"))
		userEvent.click(screen.getByText("Color-Metric (mcc)"))
		userEvent.click(screen.getByText("Edge-Metric (pairingRate)"))
		expect(await screen.findByText("You cannot create an empty Scenario")).toBeTruthy()
	})
})
