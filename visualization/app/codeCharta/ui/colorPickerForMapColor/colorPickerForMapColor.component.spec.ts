import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { ColorPickerForMapColorComponent } from "./colorPickerForMapColor.component"

import { ColorPickerForMapColorModule } from "./colorPickerForMapColor.module"

jest.mock("../../state/store/appSettings/mapColors/mapColors.selector", () => ({
	mapColorsSelector: () => ({ positive: "#ffffff" })
}))
jest.mock("../../state/store/dynamicSettings/colorRange/colorRange.selector", () => ({
	colorRangeSelector: () => ({ from: 21 })
}))

describe("colorPickerForMapColor", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [ColorPickerForMapColorModule]
		})
	})

	it("should render correctly", async () => {
		await render(ColorPickerForMapColorComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { mapColorFor: "positive" }
		})

		const renderedLabel = screen.queryByText("0 to < 21")
		expect(renderedLabel).not.toBe(null)
	})
})
