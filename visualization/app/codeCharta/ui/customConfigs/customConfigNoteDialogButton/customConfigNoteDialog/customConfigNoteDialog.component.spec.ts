import { TestBed } from "@angular/core/testing"

import { CustomConfigNoteDialogButtonModule } from "../customConfigNoteDialogButton.module"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { CustomConfigNoteDialogComponent } from "./customConfigNoteDialog.component"
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog"

describe("CustomConfigNoteDialogComponent", () => {
	const configNote = "a note"
	const mockDialogReference = { open: jest.fn(), close: jest.fn() }

	beforeEach(async () => {
		TestBed.configureTestingModule({
			imports: [CustomConfigNoteDialogButtonModule],
			providers: [
				{ provide: MatDialogRef, useValue: mockDialogReference },
				{ provide: MAT_DIALOG_DATA, useValue: configNote }
			]
		})
	})

	it("should allow a user to cancel", async () => {
		await render(CustomConfigNoteDialogComponent, { excludeComponentDeclaration: true })
		await userEvent.type(screen.getByRole("textbox"), "Some other note")

		const button = screen.getByText("Cancel").closest("button") as HTMLButtonElement
		await userEvent.click(button)

		expect(mockDialogReference.close).toHaveBeenCalled()
		expect(mockDialogReference.close).not.toHaveBeenCalledWith(configNote)
	})

	it("should open with prev note if available", async () => {
		await render(CustomConfigNoteDialogComponent, { excludeComponentDeclaration: true })
		const button = screen.getByText("Ok").closest("button") as HTMLButtonElement
		await userEvent.click(button)

		expect(mockDialogReference.close).toHaveBeenCalledWith(configNote)
	})

	it("should allow saving another note on typing", async () => {
		const newNote = "Some other note"

		await render(CustomConfigNoteDialogComponent, { excludeComponentDeclaration: true })
		await userEvent.clear(screen.getByRole("textbox"))
		await userEvent.type(screen.getByRole("textbox"), newNote)

		const button = screen.getByText("Ok").closest("button") as HTMLButtonElement
		await userEvent.click(button)

		expect(mockDialogReference.close).toHaveBeenCalledWith(newNote)
	})
})
