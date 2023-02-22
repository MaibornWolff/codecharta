import { TestBed } from "@angular/core/testing"

import { MatLegacyDialog, MatLegacyDialogRef, MAT_LEGACY_DIALOG_DATA } from "@angular/material/legacy-dialog"
import { CustomConfigNoteDialogModule } from "../customConfigNoteDialog.module"
import { fireEvent, render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { ManageCustomConfigNoteDialogComponent } from "./manageCustomConfigNoteDialog.component"

describe("ManageCustomConfigNoteDialogComponent", () => {
	const mockDialogReference = { open: jest.fn(), close: jest.fn() }
	const configNote = "note"

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [CustomConfigNoteDialogModule],
			providers: [
				{ provide: MatLegacyDialog, useValue: {} },
				{ provide: MatLegacyDialogRef, useValue: mockDialogReference },
				{ provide: MAT_LEGACY_DIALOG_DATA, useValue: configNote }
			]
		})
	})

	it("should allow a user to cancel", async () => {
		await render(ManageCustomConfigNoteDialogComponent, { excludeComponentDeclaration: true })
		await userEvent.type(screen.getByRole("textbox"), configNote)

		const button = screen.getByText("Cancel").closest("button") as HTMLButtonElement
		fireEvent.click(button)

		expect(mockDialogReference.close).toHaveBeenCalled()
		expect(mockDialogReference.close).not.toHaveBeenCalledWith(configNote)
	})

	it("should open with prev note if available", async () => {
		await render(ManageCustomConfigNoteDialogComponent, { excludeComponentDeclaration: true })
		const button = screen.getByText("Ok").closest("button") as HTMLButtonElement
		fireEvent.click(button)

		expect(mockDialogReference.close).toHaveBeenCalledWith(configNote)
	})

	it("should allow saving another note on typing", async () => {
		const newNote = "Some other note"

		await render(ManageCustomConfigNoteDialogComponent, { excludeComponentDeclaration: true })
		await userEvent.clear(screen.getByRole("textbox"))
		await userEvent.type(screen.getByRole("textbox"), newNote)

		const button = screen.getByText("Ok").closest("button") as HTMLButtonElement
		fireEvent.click(button)

		expect(mockDialogReference.close).toHaveBeenCalledWith(newNote)
	})
})
