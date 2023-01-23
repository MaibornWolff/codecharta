import { EventEmitter } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { expect } from "@jest/globals"
import { fireEvent, render, screen, waitForElementToBeRemoved } from "@testing-library/angular"

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

	it("should display label and handle brush visibility", async () => {
		const { container } = await render(LabelledColorPickerComponent, {
			excludeComponentDeclaration: true,
			componentProperties: {
				hexColor: "#000000",
				labels: ["pretty color"],
				onColorChange: { emit: handleColorChange } as unknown as EventEmitter<string>
			}
		})
		const colorPickerTrigger = container.querySelector("cc-color-picker")

		expect(container.textContent).toMatch("pretty color")

		fireEvent.mouseEnter(colorPickerTrigger)
		expectBrushVisibility(container, true)

		fireEvent.click(colorPickerTrigger)
		const colorPicker = screen.getByRole("colorpicker")
		expectBrushVisibility(container, true)

		// @ts-expect-error
		ng.getComponent(colorPicker).onChangeComplete.emit({ $event: {}, color: { hex: "#ffffff" } })
		expect(handleColorChange).toHaveBeenCalledWith("#ffffff")

		fireEvent.mouseLeave(colorPickerTrigger)
		expectBrushVisibility(container, true) // still true as color picker is still open

		fireEvent.click(document)
		await waitForElementToBeRemoved(screen.getByRole("colorpicker"))
		expectBrushVisibility(container, false)
	})
})

function expectBrushVisibility(container: Element, isVisible: boolean) {
	const isBrushVisible = (container.querySelector(".cc-color-brush") as HTMLElement)?.style.opacity === "1"
	expect(isBrushVisible).toBe(isVisible)
}
