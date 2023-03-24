import { TestBed } from "@angular/core/testing"
import { AddCustomConfigButtonModule } from "./addCustomConfigButton.module"
import { render, screen } from "@testing-library/angular"
import { AddCustomConfigButtonComponent } from "./addCustomConfigButton.component"
import userEvent from "@testing-library/user-event"
import { CustomConfigHelper } from "../../../util/customConfigHelper"
import { Vector3 } from "three"
import { ThreeCameraService } from "../../codeMap/threeViewer/threeCamera.service"
import { ThreeOrbitControlsService } from "../../codeMap/threeViewer/threeOrbitControls.service"
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed"
import { MatDialogHarness } from "@angular/material/dialog/testing"

describe("addCustomConfigButtonComponent", () => {
	beforeEach(async () => {
		TestBed.configureTestingModule({
			imports: [AddCustomConfigButtonModule],
			providers: [
				{ provide: ThreeCameraService, useValue: { camera: { position: new Vector3(0, 300, 1000) } } },
				{ provide: ThreeOrbitControlsService, useValue: { controls: { target: new Vector3(0, 0, 0) } } }
			]
		})
	})

	it("should let a user save a custom config", async () => {
		const configName = "myCustomConfig"
		const configNote = "My Custom Note"
		const addCustomConfigSpy = jest.spyOn(CustomConfigHelper, "addCustomConfig")
		const { fixture } = await render(AddCustomConfigButtonComponent, { excludeComponentDeclaration: true })
		const loader = TestbedHarnessEnvironment.documentRootLoader(fixture)
		let currentlyOpenedDialogs = await loader.getAllHarnesses(MatDialogHarness)
		expect(currentlyOpenedDialogs.length).toBe(0)

		await userEvent.click(screen.getByRole("button"))
		currentlyOpenedDialogs = await loader.getAllHarnesses(MatDialogHarness)
		expect(currentlyOpenedDialogs.length).toBe(1)

		await userEvent.type(screen.getAllByRole("textbox")[0], configName)
		await userEvent.type(screen.getAllByRole("textbox")[1], configNote)
		await userEvent.click(screen.getByRole("button", { name: "ADD" }))
		currentlyOpenedDialogs = await loader.getAllHarnesses(MatDialogHarness)

		expect(currentlyOpenedDialogs.length).toBe(0)
		expect(addCustomConfigSpy).toHaveBeenCalledTimes(1)
	})
})
