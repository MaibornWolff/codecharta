import { EventEmitter } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"

import { ColorPickerComponent } from "./colorPicker.component"
import { ColorPickerModule } from "./colorPicker.module"

describe("colorPicker", () => {
	const handleColorChange = jest.fn()

	beforeEach(() => {
		handleColorChange.mockReset()
		TestBed.configureTestingModule({
			imports: [ColorPickerModule]
		})
	})

	it("should let a user change a color", async () => {
		await render(ColorPickerComponent, {
			excludeComponentDeclaration: true,
			componentProperties: {
				hexColor: "#000000",
				onColorChange: { emit: handleColorChange } as unknown as EventEmitter<string>
			}
		})

		const colorPicker = screen.getByRole("colorpicker")
		// @ts-ignore
		ng.probe(colorPicker).componentInstance.onChangeComplete.emit({ $event: {}, color: { hex: "#ffffff" } })
		expect(handleColorChange).toHaveBeenCalledWith("#ffffff")
	})
})
