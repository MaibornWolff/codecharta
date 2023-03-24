import { TestBed } from "@angular/core/testing"

import { render, screen } from "@testing-library/angular"
import { CustomConfigNoteDialogButtonComponent } from "./customConfigNoteDialogButton.component"
import userEvent from "@testing-library/user-event"
import { CustomConfigItem } from "../customConfigs.component"
import { CustomConfigHelper } from "../../../util/customConfigHelper"
import { CustomConfigNoteDialogButtonModule } from "./customConfigNoteDialogButton.module"
import { MatDialogRef } from "@angular/material/dialog"

describe("customConfigNoteDialogComponent", () => {
	let editCustomConfigNoteSpy: jest.SpyInstance

	beforeEach(() => {
		editCustomConfigNoteSpy = jest.spyOn(CustomConfigHelper, "editCustomConfigNote").mockImplementation(() => {})
		TestBed.configureTestingModule({
			imports: [CustomConfigNoteDialogButtonModule],
			providers: [{ provide: MatDialogRef, useValue: { close: jest.fn() } }]
		})
	})

	afterEach(() => {
		editCustomConfigNoteSpy.mockRestore()
	})

	it("should render a clickable button and open a dialog to add and submit a note", async () => {
		const customConfigItem = {
			id: "configID",
			note: ""
		} as CustomConfigItem
		await render(CustomConfigNoteDialogButtonComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { customConfigItem }
		})

		const newNote = "Some other note"
		await userEvent.click(screen.getByTitle("Edit/View Note"))
		await userEvent.type(screen.getByRole("textbox"), newNote)
		await userEvent.click(screen.getByText("Ok"))

		expect(editCustomConfigNoteSpy).toHaveBeenCalledWith("configID", newNote)
	})

	it("should render a clickable button and open a dialog and and not change the note when the same note is submitted", async () => {
		const customConfigItem = {
			id: "configID",
			note: "a note"
		} as CustomConfigItem
		await render(CustomConfigNoteDialogButtonComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { customConfigItem }
		})

		const editNoteButton = screen.getByTitle("Edit/View Note")
		await userEvent.click(editNoteButton)
		await userEvent.click(screen.getByText("Ok"))

		expect(editCustomConfigNoteSpy).not.toHaveBeenCalled()
	})

	it("should render a clickable button and open a dialog and and not change the note when cancel button is clicked", async () => {
		const customConfigItem = {
			id: "configID",
			note: "a note"
		} as CustomConfigItem
		await render(CustomConfigNoteDialogButtonComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { customConfigItem }
		})

		const editNoteButton = screen.getByTitle("Edit/View Note")
		await userEvent.click(editNoteButton)
		await userEvent.click(screen.getByText("Cancel"))

		expect(editCustomConfigNoteSpy).not.toHaveBeenCalled()
	})
})
