import { TestBed } from "@angular/core/testing"
import { CustomConfigsModule } from "../../customConfigs.module"
import { MatDialog, MatDialogRef } from "@angular/material/dialog"
import { render, screen } from "@testing-library/angular"
import { CustomConfigItemGroupComponent } from "./customConfigItemGroup.component"
import { CUSTOM_CONFIG_ITEM_GROUPS } from "../../../../util/dataMocks"
import { CustomConfigHelper } from "../../../../util/customConfigHelper"
import { ThreeCameraService } from "../../../codeMap/threeViewer/threeCamera.service"
import { ThreeOrbitControlsService } from "../../../codeMap/threeViewer/threeOrbitControls.service"
import { CustomConfigInfoMessage, IsCustomConfigApplicableService } from "./isCustomConfigApplicable.service"
import userEvent from "@testing-library/user-event"

describe("customConfigItemGroupComponent", () => {
	let mockedDialog = { open: jest.fn() }
	let mockedDialogReference = { close: jest.fn() }
	const customConfigInfoMessage: CustomConfigInfoMessage = { msg: "Apply Custom View", isFullyApplicable: true }

	beforeEach(() => {
		mockedDialog = { open: jest.fn() }
		mockedDialogReference = { close: jest.fn() }

		TestBed.configureTestingModule({
			imports: [CustomConfigsModule],
			providers: [
				{ provide: MatDialogRef, useValue: mockedDialogReference },
				{ provide: MatDialog, useValue: mockedDialog },
				{
					provide: IsCustomConfigApplicableService,
					useValue: { customConfigInfoMessage, buildMessage: jest.fn() }
				},
				{ provide: ThreeCameraService, useValue: {} },
				{ provide: ThreeOrbitControlsService, useValue: {} }
			]
		})
	})

	it("should apply a custom Config and close custom config dialog", async () => {
		CustomConfigHelper.applyCustomConfig = jest.fn()
		const customConfigItemGroups = new Map([["File_B_File_C_MULTIPLE", CUSTOM_CONFIG_ITEM_GROUPS.get("File_B_File_C_MULTIPLE")]])
		await render(CustomConfigItemGroupComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { customConfigItemGroups }
		})

		await userEvent.click(screen.getByText("SampleMap View #1"))

		expect(CustomConfigHelper.applyCustomConfig).toHaveBeenCalledTimes(1)
		expect(mockedDialogReference.close).toHaveBeenCalledTimes(1)
	})

	it("should remove a custom Config and not close custom config dialog", async () => {
		CustomConfigHelper.deleteCustomConfig = jest.fn()
		const customConfigItemGroups = new Map([["File_B_File_C_MULTIPLE", CUSTOM_CONFIG_ITEM_GROUPS.get("File_B_File_C_MULTIPLE")]])
		await render(CustomConfigItemGroupComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { customConfigItemGroups }
		})

		await userEvent.click(screen.getAllByTitle("Remove Custom Config")[0])

		expect(CustomConfigHelper.deleteCustomConfig).toHaveBeenCalledTimes(1)
		expect(CustomConfigHelper.deleteCustomConfig).toHaveBeenCalledWith("File_B_File_C_MULTIPLE_Sample_Map View #1")
		expect(mockedDialogReference.close).toHaveBeenCalledTimes(0)
	})
})
