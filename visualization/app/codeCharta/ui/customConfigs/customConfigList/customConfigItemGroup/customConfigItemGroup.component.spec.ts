import { TestBed } from "@angular/core/testing"
import { CustomConfigsModule } from "../../customConfigs.module"
import { render, screen } from "@testing-library/angular"
import { CustomConfigItemGroupComponent } from "./customConfigItemGroup.component"
import { CUSTOM_CONFIG_ITEM_GROUPS } from "../../../../util/dataMocks"
import { CustomConfigHelper } from "../../../../util/customConfigHelper"
import { ThreeCameraService } from "../../../codeMap/threeViewer/threeCamera.service"
import { ThreeOrbitControlsService } from "../../../codeMap/threeViewer/threeOrbitControls.service"
import userEvent from "@testing-library/user-event"
import { expect } from "@jest/globals"
import { CustomConfigMapSelectionMode } from "../../../../model/customConfig/customConfig.api.model"
import { visibleFilesBySelectionModeSelector } from "../../visibleFilesBySelectionMode.selector"
import { MatDialog, MatDialogRef } from "@angular/material/dialog"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { State } from "@ngrx/store"
import { defaultState } from "../../../../state/store/state.manager"

describe("customConfigItemGroupComponent", () => {
	let mockedDialog = { open: jest.fn() }
	let mockedDialogReference = { close: jest.fn() }

	beforeEach(() => {
		mockedDialog = { open: jest.fn() }
		mockedDialogReference = { close: jest.fn() }

		TestBed.configureTestingModule({
			imports: [CustomConfigsModule],
			providers: [
				{ provide: MatDialogRef, useValue: mockedDialogReference },
				{ provide: MatDialog, useValue: mockedDialog },
				{ provide: ThreeCameraService, useValue: {} },
				{ provide: ThreeOrbitControlsService, useValue: {} },
				provideMockStore({
					selectors: [
						{
							selector: visibleFilesBySelectionModeSelector,
							value: {
								mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE,
								assignedMaps: new Map([
									["md5_fileB", "fileB"],
									["md5_fileC", "fileC"]
								])
							}
						}
					]
				}),
				{ provide: State, useValue: { getValue: () => defaultState } }
			]
		})
	})

	it("should apply a custom Config and close custom config dialog", async () => {
		CustomConfigHelper.applyCustomConfig = jest.fn()
		const customConfigItemGroups = new Map([["File_B_File_C_STANDARD", CUSTOM_CONFIG_ITEM_GROUPS.get("File_B_File_C_STANDARD")]])
		await render(CustomConfigItemGroupComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { customConfigItemGroups }
		})
		const applyCustomConfigButton = screen.getAllByText("mcc")[0].closest("button")
		await userEvent.click(applyCustomConfigButton)

		expect(applyCustomConfigButton.disabled).toBe(false)
		expect(CustomConfigHelper.applyCustomConfig).toHaveBeenCalledTimes(1)
		expect(mockedDialogReference.close).toHaveBeenCalledTimes(1)
	})

	it("should remove a custom Config and not close custom config dialog", async () => {
		CustomConfigHelper.deleteCustomConfig = jest.fn()
		const customConfigItemGroups = new Map([["File_B_File_C_STANDARD", CUSTOM_CONFIG_ITEM_GROUPS.get("File_B_File_C_STANDARD")]])
		await render(CustomConfigItemGroupComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { customConfigItemGroups }
		})

		await userEvent.click(screen.getAllByTitle("Remove Custom View")[0])

		expect(CustomConfigHelper.deleteCustomConfig).toHaveBeenCalledTimes(1)
		expect(CustomConfigHelper.deleteCustomConfig).toHaveBeenCalledWith("File_B_File_C_STANDARD_Sample_Map View #1")
		expect(mockedDialogReference.close).toHaveBeenCalledTimes(0)
	})

	it("should apply a custom config and close custom config dialog when clicking on config name", async () => {
		const customConfigItemGroups = new Map([["File_B_File_C_STANDARD", CUSTOM_CONFIG_ITEM_GROUPS.get("File_B_File_C_STANDARD")]])
		await render(CustomConfigItemGroupComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { customConfigItemGroups }
		})

		CustomConfigHelper.applyCustomConfig = jest.fn()
		const applyCustomConfigButton = screen.getByText("SampleMap View #1").closest("span") as HTMLElement

		await userEvent.click(applyCustomConfigButton)

		expect(CustomConfigHelper.applyCustomConfig).toHaveBeenCalledTimes(1)
		expect(mockedDialogReference.close).toHaveBeenCalledTimes(1)
	})

	it("should show tooltip with missing maps and correct selection mode if selected custom config is not fully applicable", async () => {
		const customConfigItemGroups = new Map([["File_B_File_C_STANDARD", CUSTOM_CONFIG_ITEM_GROUPS.get("File_B_File_C_STANDARD")]])
		const { rerender } = await render(CustomConfigItemGroupComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { customConfigItemGroups }
		})
		const store = TestBed.inject(MockStore)
		store.overrideSelector(visibleFilesBySelectionModeSelector, {
			mapSelectionMode: CustomConfigMapSelectionMode.DELTA,
			assignedMaps: new Map([["md5_fileB", "fileB"]])
		})
		store.refreshState()
		await rerender({ componentProperties: { customConfigItemGroups } })

		const applyCustomConfigButton = screen.getAllByText("mcc")[0].closest("button")

		expect(
			screen.getAllByTitle(
				"This view is partially applicable. To complete your view, please switch to the STANDARD mode and select the following map(s): fileC."
			).length
		).toBe(2)
		expect(getComputedStyle(applyCustomConfigButton).color).toBe("rgb(204, 204, 204)")
	})

	it("should not be clickable for non-applicable custom configs, but can still change notes of custom configs", async () => {
		CustomConfigHelper.applyCustomConfig = jest.fn()
		CustomConfigHelper.applyCustomConfig = jest.fn()
		CUSTOM_CONFIG_ITEM_GROUPS.get("File_B_File_C_STANDARD").hasApplicableItems = false
		CUSTOM_CONFIG_ITEM_GROUPS.get("File_B_File_C_STANDARD").customConfigItems[0].isApplicable = false
		CUSTOM_CONFIG_ITEM_GROUPS.get("File_B_File_C_STANDARD").customConfigItems[1].isApplicable = false
		const customConfigItemGroups = new Map([["File_B_File_C_STANDARD", CUSTOM_CONFIG_ITEM_GROUPS.get("File_B_File_C_STANDARD")]])
		const { rerender } = await render(CustomConfigItemGroupComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { customConfigItemGroups }
		})
		const store = TestBed.inject(MockStore)
		store.overrideSelector(visibleFilesBySelectionModeSelector, {
			mapSelectionMode: CustomConfigMapSelectionMode.DELTA,
			assignedMaps: new Map([["md5_fileA", "fileA"]])
		})
		store.refreshState()
		await rerender({ componentProperties: { customConfigItemGroups } })

		const editNoteArea = screen.getAllByTitle("Edit/View Note")[0] as HTMLButtonElement
		const applyCustomConfigButton = screen.getAllByText("mcc")[0].closest("button") as HTMLButtonElement

		expect(applyCustomConfigButton.disabled).toBe(true)
		expect(editNoteArea.disabled).toBe(false)
		expect(getComputedStyle(applyCustomConfigButton).color).toBe("rgb(204, 204, 204)")
	})
})
