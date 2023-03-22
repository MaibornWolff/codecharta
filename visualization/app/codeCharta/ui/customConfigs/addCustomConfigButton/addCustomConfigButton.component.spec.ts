import { TestBed } from "@angular/core/testing"
import { AddCustomConfigButtonModule } from "./addCustomConfigButton.module"
import { render, screen } from "@testing-library/angular"
import { AddCustomConfigButtonComponent } from "./addCustomConfigButton.component"
import userEvent from "@testing-library/user-event"
import { CustomConfigHelper } from "../../../util/customConfigHelper"
import { Vector3 } from "three"
import { ThreeCameraService } from "../../codeMap/threeViewer/threeCamera.service"
import { ThreeOrbitControlsService } from "../../codeMap/threeViewer/threeOrbitControls.service"

describe("addCustomConfigButtonComponent", () => {
	beforeEach(async () => {
		TestBed.configureTestingModule({
			imports: [AddCustomConfigButtonModule],
			providers: [
				{ provide: ThreeCameraService, useValue: { camera: { position: new Vector3(0, 300, 1000) } } },
				{
					provide: ThreeOrbitControlsService,
					useValue: { controls: { target: new Vector3(0, 0, 0) } }
				}
			]
		})
	})

	it("should let a user save a custom config", async () => {
		const addCustomConfigSpy = jest.spyOn(CustomConfigHelper, "addCustomConfig")
		await render(AddCustomConfigButtonComponent, { excludeComponentDeclaration: true })
		const configName = "myCustomConfig"
		const configNote = "My Custom Note"

		await userEvent.click(screen.getByRole("button"))
		await userEvent.type(screen.getAllByRole("textbox")[0], configName)
		await userEvent.type(screen.getAllByRole("textbox")[1], configNote)
		await userEvent.click(screen.getByRole("button", { name: "ADD" }))

		expect(addCustomConfigSpy).toHaveBeenCalledTimes(1)
	})
})
