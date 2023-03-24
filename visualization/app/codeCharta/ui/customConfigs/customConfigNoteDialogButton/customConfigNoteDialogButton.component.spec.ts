import { TestBed } from "@angular/core/testing"

import { render, screen } from "@testing-library/angular"
import { CustomConfigNoteDialogButtonComponent } from "./customConfigNoteDialogButton.component"
import userEvent from "@testing-library/user-event"
import { CustomConfigItem } from "../customConfigs.component"
import { CustomConfigHelper } from "../../../util/customConfigHelper"
import { CustomConfigNoteDialogButtonModule } from "./customConfigNoteDialogButton.module"
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed"
import { MatDialogHarness } from "@angular/material/dialog/testing"

describe("customConfigNoteDialogComponent", () => {
	let editCustomConfigNoteSpy: jest.SpyInstance

	beforeEach(() => {
		editCustomConfigNoteSpy = jest.spyOn(CustomConfigHelper, "editCustomConfigNote").mockImplementation(() => {})
		TestBed.configureTestingModule({
			imports: [CustomConfigNoteDialogButtonModule]
		})
	})

	afterEach(() => {
		editCustomConfigNoteSpy.mockRestore()
	})

	it("should render a clickable button and open a dialog to add and submit a note", async () => {
		const newNote = "Some other note"
		const customConfigItem = {
			id: "configID",
			note: ""
		} as CustomConfigItem
		const { fixture } = await render(CustomConfigNoteDialogButtonComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { customConfigItem }
		})
		const loader = TestbedHarnessEnvironment.documentRootLoader(fixture)
		let currentlyOpenedDialogs = await loader.getAllHarnesses(MatDialogHarness)

		expect(currentlyOpenedDialogs.length).toBe(0)
		await userEvent.click(screen.getByTitle("Edit/View Note"))

		currentlyOpenedDialogs = await loader.getAllHarnesses(MatDialogHarness)
		expect(currentlyOpenedDialogs.length).toBe(1)

		await userEvent.type(screen.getByRole("textbox"), newNote)
		await userEvent.click(screen.getByText("Ok"))

		currentlyOpenedDialogs = await loader.getAllHarnesses(MatDialogHarness)
		expect(currentlyOpenedDialogs.length).toBe(0)

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
		const { fixture } = await render(CustomConfigNoteDialogButtonComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { customConfigItem }
		})
		const loader = TestbedHarnessEnvironment.documentRootLoader(fixture)
		const editNoteButton = screen.getByTitle("Edit/View Note")

		await userEvent.click(editNoteButton)
		await userEvent.click(screen.getByText("Cancel"))
		const currentlyOpenedDialogs = await loader.getAllHarnesses(MatDialogHarness)

		expect(currentlyOpenedDialogs.length).toBe(0)
		expect(editCustomConfigNoteSpy).not.toHaveBeenCalled()
	})
})
