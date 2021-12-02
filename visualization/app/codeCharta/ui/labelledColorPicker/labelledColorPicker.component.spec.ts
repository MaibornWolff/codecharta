import { EventEmitter } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { render, fireEvent, screen, waitForElementToBeRemoved, waitFor } from "@testing-library/angular"

import { LabelledColorPickerComponent } from "./labelledColorPicker.component"
import { LabelledColorPickerModule } from "./labelledColorPicker.module"

describe("labelledColorPicker", () => {
	const handleColorChange = jest.fn()

	beforeEach(() => {
		handleColorChange.mockReset()
		TestBed.configureTestingModule({
			imports: [LabelledColorPickerModule]
		})
	})

	it("should let a user change a color", async () => {
		const { container } = await render(LabelledColorPickerComponent, {
			excludeComponentDeclaration: true,
			componentProperties: {
				hexColor: "#000000",
				labels: ["pretty color"],
				onColorChange: { emit: handleColorChange } as unknown as EventEmitter<string>
			}
		})

		fireEvent.click(container)
		const colorPicker = await waitFor(() => screen.getByRole("colorpicker"))
		expectBrushVisibility(container, true)

		// @ts-ignore
		ng.probe(colorPicker).componentInstance.onChangeComplete.emit({ $event: {}, color: { hex: "#ffffff" } })
		expect(handleColorChange).toHaveBeenCalledWith("#ffffff")

		const outside = document.querySelector(".cdk-overlay-backdrop")
		fireEvent.click(outside)

		await waitForElementToBeRemoved(screen.getByRole("colorpicker"))
		expectBrushVisibility(container, false)
	})
})

function expectBrushVisibility(container: Element, isVisible: boolean) {
	const isBrushVisible = (container.querySelector(".cc-color-brush") as HTMLElement)?.style.opacity === "1"
	expect(isBrushVisible).toBe(isVisible)
}
