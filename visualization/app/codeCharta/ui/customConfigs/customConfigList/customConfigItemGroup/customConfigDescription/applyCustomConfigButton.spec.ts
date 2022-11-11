import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { expect } from "@jest/globals"
import { ApplyCustomConfigButtonComponent } from "./applyCustomConfigButton.component"
import { CustomConfigsModule } from "../../../customConfigs.module"
import { ThreeCameraService } from "../../../../codeMap/threeViewer/threeCamera.service"
import { ThreeOrbitControlsService } from "../../../../codeMap/threeViewer/threeOrbitControls.service"
import { CUSTOM_CONFIG_ITEM_GROUPS } from "../../../../../util/dataMocks"
import { CustomConfigHelper } from "../../../../../util/customConfigHelper"
import { MatDialogRef } from "@angular/material/dialog"

describe("applyCustomConfigButtonComponent", () => {
	const mockedDialogReference = { close: jest.fn() }

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [CustomConfigsModule],
			providers: [
				{ provide: MatDialogRef, useValue: mockedDialogReference },
				{ provide: ThreeCameraService, useValue: {} },
				{ provide: ThreeOrbitControlsService, useValue: {} }
			]
		})
	})

	it("should apply a custom Config and show all relevant information belonging to the config", async () => {
		CustomConfigHelper.applyCustomConfig = jest.fn()
		const customConfigItem = CUSTOM_CONFIG_ITEM_GROUPS.get("File_B_File_C_STANDARD").customConfigItems[0]
		const { container } = await render(ApplyCustomConfigButtonComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { customConfigItem }
		})

		const colorSwatchElements = container.getElementsByClassName("color-swatch")
		expect(colorSwatchElements.length).toBe(4)
		expect(getComputedStyle(colorSwatchElements[0]).backgroundColor).toBe("rgb(105, 174, 64)")
		expect(getComputedStyle(colorSwatchElements[1]).backgroundColor).toBe("rgb(221, 204, 0)")
		expect(getComputedStyle(colorSwatchElements[2]).backgroundColor).toBe("rgb(130, 14, 14)")
		expect(getComputedStyle(colorSwatchElements[3]).backgroundColor).toBe("rgb(235, 131, 25)")

		expect(screen.getByText("SampleMap View #1")).not.toBeNull()
		expect(screen.getByText("rloc")).not.toBeNull()
		expect(screen.getByText("mcc")).not.toBeNull()
		expect(screen.getByText("avgCommits")).not.toBeNull()

		const applyCustomConfigButton = screen.getByRole("button") as HTMLButtonElement
		await userEvent.click(applyCustomConfigButton)

		expect(applyCustomConfigButton.disabled).toBe(false)
		expect(CustomConfigHelper.applyCustomConfig).toHaveBeenCalledTimes(1)
	})

	it("should not apply a custom Config when it's not applicable but show all relevant information belonging to the config", async () => {
		CustomConfigHelper.applyCustomConfig = jest.fn()
		const customConfigItem = CUSTOM_CONFIG_ITEM_GROUPS.get("File_B_File_C_STANDARD").customConfigItems[0]
		customConfigItem.isApplicable = false
		await render(ApplyCustomConfigButtonComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { customConfigItem }
		})
		const applyCustomConfigButton = screen.getByRole("button") as HTMLButtonElement

		expect(getComputedStyle(applyCustomConfigButton).color).toBe("rgb(204, 204, 204)")
		expect(screen.getByText("SampleMap View #1")).not.toBeNull()
		expect(screen.getByText("rloc")).not.toBeNull()
		expect(screen.getByText("mcc")).not.toBeNull()
		expect(screen.getByText("avgCommits")).not.toBeNull()

		await userEvent.click(applyCustomConfigButton)

		expect(applyCustomConfigButton.disabled).toBe(true)
		expect(CustomConfigHelper.applyCustomConfig).not.toHaveBeenCalled()
	})
})
