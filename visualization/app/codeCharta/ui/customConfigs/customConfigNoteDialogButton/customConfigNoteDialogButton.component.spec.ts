import { ComponentFixture, TestBed } from "@angular/core/testing"

import { screen } from "@testing-library/angular"
import { CustomConfigNoteDialogButtonComponent } from "./customConfigNoteDialogButton.component"
import userEvent from "@testing-library/user-event"
import { CustomConfigItem } from "../customConfigs.component"
import { CustomConfigHelper } from "../../../util/customConfigHelper"
import { CustomConfigNoteDialogButtonModule } from "./customConfigNoteDialogButton.module"

describe("customConfigNoteDialogComponent", () => {
	let component: CustomConfigNoteDialogButtonComponent
	let fixture: ComponentFixture<CustomConfigNoteDialogButtonComponent>
	let editCustomConfigNoteSpy: jest.SpyInstance

	beforeEach(async () => {
		editCustomConfigNoteSpy = jest.spyOn(CustomConfigHelper, "editCustomConfigNote").mockImplementation(() => {})
		await TestBed.configureTestingModule({
			imports: [CustomConfigNoteDialogButtonModule]
		})
	})

	beforeEach(() => {
		fixture = TestBed.createComponent(CustomConfigNoteDialogButtonComponent)
		component = fixture.componentInstance
		component.customConfigItem = {
			id: "configID",
			note: ""
		} as CustomConfigItem
		fixture.detectChanges()
	})

	afterEach(() => {
		editCustomConfigNoteSpy.mockRestore()
	})

	it("should render a clickable button and open a dialog to add and submit a note", async () => {
		const newNote = "Some other note"
		await userEvent.click(screen.getByTitle("Edit/View Note"))
		await userEvent.type(screen.getByRole("textbox"), newNote)
		await userEvent.click(screen.getByText("Ok"))

		expect(editCustomConfigNoteSpy).toHaveBeenCalledWith("configID", newNote)
	})

	it("should render a clickable button and open a dialog and and not change the note when the same note is submitted", async () => {
		component.customConfigItem.note = "a note"
		fixture.detectChanges()

		const editNoteButton = screen.getByTitle("Edit/View Note")
		await userEvent.click(editNoteButton)
		await userEvent.click(screen.getByText("Ok"))

		expect(editCustomConfigNoteSpy).not.toHaveBeenCalled()
	})

	it("should render a clickable button and open a dialog and and not change the note when cancel button is clicked", async () => {
		component.customConfigItem.note = "a note"
		fixture.detectChanges()

		const editNoteButton = screen.getByTitle("Edit/View Note")
		await userEvent.click(editNoteButton)
		await userEvent.click(screen.getByText("Cancel"))

		expect(editCustomConfigNoteSpy).not.toHaveBeenCalled()
	})
})
