import { TestBed } from "@angular/core/testing"
import { AddCustomConfigButtonModule } from "../addCustomConfigButton.module"
import { MatDialog } from "@angular/material/dialog"
import { render, screen } from "@testing-library/angular"
import { AddCustomConfigDialogComponent } from "./addCustomConfigDialog.component"
import { CustomConfigHelper } from "../../../../util/customConfigHelper"

describe("addCustomConfigDialogComponent", () => {
	const mockedDialog = { open: jest.fn() }

	beforeEach(async () => {
		TestBed.configureTestingModule({
			imports: [AddCustomConfigButtonModule],
			providers: [{ provide: MatDialog, useValue: mockedDialog }]
		})
	})

	it("should suggest a valid custom view name", async () => {
		jest.spyOn(CustomConfigHelper, "getConfigNameSuggestionByFileState").mockReturnValue("new custom view name")
		await render(AddCustomConfigDialogComponent, { excludeComponentDeclaration: true })

		const input = screen.getByRole("textbox") as HTMLInputElement

		expect(input.value).toBe("new custom view name")
	})
})
