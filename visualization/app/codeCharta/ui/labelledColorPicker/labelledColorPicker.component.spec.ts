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

	it("should let a user change a color within a menu", async () => {
		const { container } = await render(LabelledColorPickerComponent, {
			excludeComponentDeclaration: true,
			componentProperties: {
				hexColor: "#000000",
				labels: ["pretty color"],
				onColorChange: { emit: handleColorChange } as unknown as EventEmitter<string>
			}
		})

		expect(container.textContent).toMatch("pretty color")

		fireEvent.click(container)
		const colorPicker = await waitFor(() => screen.getByRole("colorpicker"))
		expectBrushVisibility(container, true)

		// @ts-ignore
		ng.probe(colorPicker).componentInstance.onChangeComplete.emit({ $event: {}, color: { hex: "#ffffff" } })
		expect(handleColorChange).toHaveBeenCalledWith("#ffffff")

		fireEvent.click(document)

		await waitForElementToBeRemoved(screen.getByRole("colorpicker"))
		expectBrushVisibility(container, false)
	})

	it("should add/remove brush on mouseenter/mouseleave", async () => {
		const { container } = await render(LabelledColorPickerComponent, {
			excludeComponentDeclaration: true,
			componentProperties: {
				hexColor: "#000000",
				labels: ["pretty color"],
				onColorChange: { emit: handleColorChange } as unknown as EventEmitter<string>
			}
		})

		expectBrushVisibility(container, false)

		fireEvent.mouseEnter(container)
		expectBrushVisibility(container, true)

		fireEvent.mouseLeave(container)
		expectBrushVisibility(container, false)
	})
})

function expectBrushVisibility(container: Element, isVisible: boolean) {
	const isBrushVisible = (container.querySelector(".cc-color-brush") as HTMLElement)?.style.opacity === "1"
	expect(isBrushVisible).toBe(isVisible)
}
