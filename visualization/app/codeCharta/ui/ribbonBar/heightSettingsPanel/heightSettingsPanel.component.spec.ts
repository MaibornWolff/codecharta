import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { setColorLabels } from "../../../state/store/appSettings/colorLabels/colorLabels.actions"
import { addFile, setDelta } from "../../../state/store/files/files.actions"
import { Store } from "../../../state/store/store"
import { TEST_FILE_DATA } from "../../../util/dataMocks"
import { HeightSettingsPanelComponent } from "./heightSettingsPanel.component"
import { HeightSettingsPanelModule } from "./heightSettingsPanel.module"

describe("heightSettingsPanelComponent", () => {
	beforeEach(() => {
		Store["initialize"]()
		TestBed.configureTestingModule({
			imports: [HeightSettingsPanelModule]
		})
	})

	it("should disable amount of top labels slider when there are colorLabels", async () => {
		Store.dispatch(
			setColorLabels({
				positive: true,
				negative: false,
				neutral: false
			})
		)
		await render(HeightSettingsPanelComponent, { excludeComponentDeclaration: true })

		const amountOfTopLabelsSlider = screen.getByTitle("Disabled because color labels are used")
		const matSlider = amountOfTopLabelsSlider.querySelector("mat-slider")
		expect(matSlider.getAttribute("aria-disabled")).toBe("true")
	})

	it("should enable amount of top labels slider when there are no colorLabels", async () => {
		await render(HeightSettingsPanelComponent, { excludeComponentDeclaration: true })

		const amountOfTopLabelsSlider = screen.getByTitle("Display the labels of the 1 highest buildings")
		const matSlider = amountOfTopLabelsSlider.querySelector("mat-slider")
		expect(matSlider.getAttribute("aria-disabled")).toBe("false")
	})

	it("should not display invertHeight-checkbox when being in delta mode", async () => {
		Store.dispatch(addFile(TEST_FILE_DATA))
		Store.dispatch(setDelta(TEST_FILE_DATA, TEST_FILE_DATA))
		await render(HeightSettingsPanelComponent, { excludeComponentDeclaration: true })
		expect(screen.queryByText("Invert Height")).toBe(null)
	})

	it("should display invertHeight-checkbox when not being in delta mode", async () => {
		await render(HeightSettingsPanelComponent, { excludeComponentDeclaration: true })
		expect(screen.queryByText("Invert Height")).not.toBe(null)
	})
})
