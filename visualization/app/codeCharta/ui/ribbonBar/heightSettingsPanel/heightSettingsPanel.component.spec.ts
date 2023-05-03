import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { setColorLabels } from "../../../state/store/appSettings/colorLabels/colorLabels.actions"
import { addFile, setDelta } from "../../../state/store/files/files.actions"
import { TEST_FILE_DATA } from "../../../util/dataMocks"
import { HeightSettingsPanelComponent } from "./heightSettingsPanel.component"
import { HeightSettingsPanelModule } from "./heightSettingsPanel.module"
import { Store, StoreModule } from "@ngrx/store"
import { appReducers, setStateMiddleware } from "../../../state/store/state.manager"

describe("heightSettingsPanelComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HeightSettingsPanelModule, StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]
		})
	})

	it("should disable amount of top labels slider when there are colorLabels", async () => {
		const { detectChanges } = await render(HeightSettingsPanelComponent, { excludeComponentDeclaration: true })
		const store = TestBed.inject(Store)
		store.dispatch(
			setColorLabels({
				value: {
					positive: true,
					negative: false,
					neutral: false
				}
			})
		)
		detectChanges()

		const amountOfTopLabelsSlider = screen.getByTitle("Disabled because color labels are used")
		const matSlider = amountOfTopLabelsSlider.querySelector("mat-slider")
		expect(matSlider.getAttribute("ng-reflect-disabled")).toBe("true")
	})

	it("should enable amount of top labels slider when there are no colorLabels", async () => {
		await render(HeightSettingsPanelComponent, { excludeComponentDeclaration: true })

		const amountOfTopLabelsSlider = screen.getByTitle("Display the labels of the 1 highest buildings")
		const matSlider = amountOfTopLabelsSlider.querySelector("mat-slider")

		expect(matSlider.getAttribute("ng-reflect-disabled")).toBe("false")
	})

	it("should not display invertHeight-checkbox when being in delta mode", async () => {
		const { detectChanges } = await render(HeightSettingsPanelComponent, { excludeComponentDeclaration: true })
		const store = TestBed.inject(Store)
		store.dispatch(addFile({ file: TEST_FILE_DATA }))
		store.dispatch(setDelta({ referenceFile: TEST_FILE_DATA, comparisonFile: TEST_FILE_DATA }))
		detectChanges()

		expect(screen.queryByText("Invert Height")).toBe(null)
	})

	it("should display invertHeight-checkbox when not being in delta mode", async () => {
		await render(HeightSettingsPanelComponent, { excludeComponentDeclaration: true })
		expect(screen.queryByText("Invert Height")).not.toBe(null)
	})
})
