import { TestBed } from "@angular/core/testing"
import { MatDialogRef } from "@angular/material/dialog"
import { render } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { Vector3 } from "three"
import { ThreeCameraServiceToken, ThreeOrbitControlsServiceToken } from "../../../services/ajs-upgraded-providers"
import { ScenarioHelper } from "../../../util/scenarioHelper"
import { AddCustomScenarioComponent } from "./addCustomScenario.component"
import { AddCustomScenarioModule } from "./addCustomScenario.module"

describe("AddCustomScenarioComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [AddCustomScenarioModule],
			providers: [
				{ provide: ThreeCameraServiceToken, useValue: { camera: { position: new Vector3(0, 300, 1000) } } },
				{ provide: ThreeOrbitControlsServiceToken, useValue: { controls: { target: new Vector3(0, 0, 0) } } },
				{ provide: MatDialogRef, useValue: { close: jest.fn() } }
			]
		})
	})

	it("should enable the user to add a custom scenario", async () => {
		ScenarioHelper.addScenario = jest.fn()
		const { container } = await render(AddCustomScenarioComponent, { excludeComponentDeclaration: true })
		const closeDialog = TestBed.inject(MatDialogRef).close

		userEvent.type(container.querySelector("input"), "my-custom-scenario")
		userEvent.click(container.querySelector("button"))

		expect(ScenarioHelper.addScenario).toHaveBeenCalled()
		expect(closeDialog).toHaveBeenCalled()
	})
})
