import { TestBed } from "@angular/core/testing"
import { AddCustomConfigButtonModule } from "./addCustomConfigButton.module"
import { MatDialog } from "@angular/material/dialog"
import { fireEvent, render, screen } from "@testing-library/angular"
import { AddCustomConfigButtonComponent } from "./addCustomConfigButton.component"
import { AddCustomConfigDialogComponent } from "./addCustomConfigDialog/addCustomConfigDialog.component"

describe("addCustomConfigButtonComponent", () => {
	const mockedDialog = { open: jest.fn() }

	beforeEach(async () => {
		TestBed.configureTestingModule({
			imports: [AddCustomConfigButtonModule],
			providers: [{ provide: MatDialog, useValue: mockedDialog }]
		})
	})

	it("should open add custom config dialog on click", async () => {
		await render(AddCustomConfigButtonComponent, { excludeComponentDeclaration: true })

		const button = screen.getByRole("button")
		fireEvent.click(button)

		expect(mockedDialog.open).toHaveBeenCalledWith(AddCustomConfigDialogComponent, { panelClass: "cc-add-custom-config-dialog" })
	})
})
