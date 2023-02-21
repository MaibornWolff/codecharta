import { ComponentFixture, TestBed } from "@angular/core/testing"
import { screen } from "@testing-library/angular"
import { LayoutAlgorithm } from "../../../../../codeCharta.model"
import { setLayoutAlgorithm } from "../../../../../state/store/appSettings/layoutAlgorithm/layoutAlgorithm.actions"
import { Store } from "../../../../../state/store/store"
import { MapLayoutSelectionComponent } from "./mapLayoutSelection.component"
import { MapLayoutSelectionModule } from "./mapLayoutSelection.module"
import { HarnessLoader } from "@angular/cdk/testing"
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed"
import { MatSelectHarness } from "@angular/material/select/testing"
import { MatInputHarness } from "@angular/material/input/testing"

let loader: HarnessLoader

describe("MapLayoutSelectionComponent", () => {
	let fixture: ComponentFixture<MapLayoutSelectionComponent>

	beforeEach(() => {
		Store["initialize"]()
		TestBed.configureTestingModule({
			imports: [MapLayoutSelectionModule],
			declarations: [MapLayoutSelectionComponent]
		}).compileComponents()
		fixture = TestBed.createComponent(MapLayoutSelectionComponent)
		loader = TestbedHarnessEnvironment.loader(fixture)
	})

	it("should change map layout selection", async () => {
		const select = await loader.getHarness(MatSelectHarness)
		expect(await select.getValueText()).toBe("Squarified TreeMap")

		await select.open()
		await select.clickOptions({ text: "StreetMap" })
		expect(await select.getValueText()).toBe("StreetMap")
	})

	it("should not display max tree map files slider when layout selection is NOT 'TreeMapStreet'", async () => {
		await loader.getHarness(MatSelectHarness)
		expect(screen.queryByText("Maximum TreeMap Files")).toBe(null)
	})

	it("should display max tree map files slider when layout selection is 'TreeMapStreet'", async () => {
		Store.dispatch(setLayoutAlgorithm(LayoutAlgorithm.TreeMapStreet))
		const select = await loader.getHarness(MatSelectHarness)
		expect(await select.getValueText()).toBe("TreeMapStreet")
		expect(screen.queryByText("Maximum TreeMap Files")).not.toBe(null)

		const input = await loader.getHarness(MatInputHarness)
		expect(await input.getValue()).toBe("100")

		await input.setValue("42")
		expect(await input.getValue()).toBe("42")
	})
})
