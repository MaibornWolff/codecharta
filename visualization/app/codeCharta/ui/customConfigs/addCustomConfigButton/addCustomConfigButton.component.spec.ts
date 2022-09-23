import { TestBed } from "@angular/core/testing"
import { AddCustomConfigButtonModule } from "./addCustomConfigButton.module"
import { fireEvent, render, screen } from "@testing-library/angular"
import { AddCustomConfigButtonComponent } from "./addCustomConfigButton.component"
import userEvent from "@testing-library/user-event"
import { waitForElementToBeRemoved } from "@testing-library/dom"
import { CustomConfigHelper } from "../../../util/customConfigHelper"
import { ThreeCameraServiceToken, ThreeOrbitControlsServiceToken } from "../../../services/ajs-upgraded-providers"
import { Vector3 } from "three"

describe("addCustomConfigButtonComponent", () => {
	beforeEach(async () => {
		TestBed.configureTestingModule({
			imports: [AddCustomConfigButtonModule],
			providers: [
				{ provide: ThreeCameraServiceToken, useValue: { camera: { position: new Vector3(0, 300, 1000) } } },
				{ provide: ThreeOrbitControlsServiceToken, useValue: { controls: { target: new Vector3(0, 0, 0) } } }
			]
		})
	})

	it("should let a user save a custom config", async () => {
		const addCustomConfigSpy = jest.spyOn(CustomConfigHelper, "addCustomConfig")
		await render(AddCustomConfigButtonComponent, { excludeComponentDeclaration: true })

		const button = screen.getByRole("button")
		fireEvent.click(button)

		await screen.findByText("Add Custom View")

		await userEvent.type(screen.getByRole("textbox"), "myCustomConfig")
		fireEvent.click(screen.getByRole("button", { name: "ADD" }))

		await waitForElementToBeRemoved(screen.getByText("Add Custom View"))
		expect(addCustomConfigSpy).toHaveBeenCalledTimes(1)
	})
})
