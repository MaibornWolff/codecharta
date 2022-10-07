import { TestBed } from "@angular/core/testing"
import { AddCustomConfigButtonModule } from "../addCustomConfigButton.module"
import { render, screen } from "@testing-library/angular"
import { AddCustomConfigDialogComponent } from "./addCustomConfigDialog.component"
import { CustomConfigHelper } from "../../../../util/customConfigHelper"
import userEvent from "@testing-library/user-event"
import { MatDialog } from "@angular/material/dialog"
import { Vector3 } from "three"
import { ThreeOrbitControlsServiceToken } from "../../../../services/ajs-upgraded-providers"
import { ThreeCameraService } from "../../../codeMap/threeViewer/threeCamera.service"

describe("addCustomConfigDialogComponent", () => {
	jest.spyOn(CustomConfigHelper, "getConfigNameSuggestionByFileState").mockReturnValue("new custom view name")

	beforeEach(async () => {
		const mockedDialog = { open: jest.fn() }
		TestBed.configureTestingModule({
			imports: [AddCustomConfigButtonModule],
			providers: [
				{ provide: MatDialog, useValue: mockedDialog },
				{ provide: ThreeCameraService, useValue: { camera: { position: new Vector3(0, 300, 1000) } } },
				{ provide: ThreeOrbitControlsServiceToken, useValue: { controls: { target: new Vector3(0, 0, 0) } } }
			]
		})
	})

	it("should suggest a valid custom view name and 'add' button is enabled", async () => {
		await render(AddCustomConfigDialogComponent, { excludeComponentDeclaration: true })

		const input = screen.getByRole("textbox") as HTMLInputElement

		expect(input.value).toBe("new custom view name")
		expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(false)
	})

	it("should show error message when input field is empty and disable 'add' button", async () => {
		await render(AddCustomConfigDialogComponent, { excludeComponentDeclaration: true })

		const input = screen.getByRole("textbox") as HTMLInputElement
		await userEvent.clear(input)
		input.blur()

		expect(await screen.findByText("Please enter a view name.")).not.toBeNull()
		expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true)
	})

	it("should show error message when file name already exists and disable 'add' button", async () => {
		await render(AddCustomConfigDialogComponent, { excludeComponentDeclaration: true })
		jest.spyOn(CustomConfigHelper, "hasCustomConfigByName").mockReturnValue(true)

		const input = screen.getByRole("textbox") as HTMLInputElement
		await userEvent.type(input, "file name already exists")
		input.blur()

		expect(await screen.findByText("A Custom View with this name already exists.")).not.toBeNull()
		expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true)
	})
})
