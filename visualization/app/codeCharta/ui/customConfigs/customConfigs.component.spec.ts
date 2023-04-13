import { provideMockStore } from "@ngrx/store/testing"
import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { CustomConfigsComponent } from "./customConfigs.component"
import { AddCustomConfigDialogComponent } from "./addCustomConfigButton/addCustomConfigDialog/addCustomConfigDialog.component"
import { CustomConfigListComponent } from "./customConfigList/customConfigList.component"
import { CustomConfigsModule } from "./customConfigs.module"
import { MatDialog } from "@angular/material/dialog"
import userEvent from "@testing-library/user-event"

describe("CustomConfigsComponent", () => {
	let mockedDialog = { open: jest.fn() }

	beforeEach(() => {
		mockedDialog = { open: jest.fn() }
		TestBed.configureTestingModule({
			imports: [CustomConfigsModule],
			providers: [{ provide: MatDialog, useValue: mockedDialog }, provideMockStore()]
		})
	})

	it("should open dialog when clicking add custom config button", async () => {
		await render(CustomConfigsComponent, { excludeComponentDeclaration: true })

		const addButton = screen.getByTitle("Create new Custom View")
		await userEvent.click(addButton)

		expect(mockedDialog.open).toHaveBeenCalledTimes(1)
		expect(mockedDialog.open).toHaveBeenCalledWith(AddCustomConfigDialogComponent, { panelClass: "cc-add-custom-config-dialog" })
	})

	it("should open dialog when clicking add custom config button", async () => {
		await render(CustomConfigsComponent, { excludeComponentDeclaration: true })

		const openCustomConfigsButton = screen.getByTitle("Open your saved Custom Views")
		await userEvent.click(openCustomConfigsButton)

		expect(mockedDialog.open).toHaveBeenCalledTimes(1)
		expect(mockedDialog.open).toHaveBeenCalledWith(CustomConfigListComponent, { panelClass: "cc-custom-config-list" })
	})
})
