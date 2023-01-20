import { Component } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { fireEvent, render, screen, waitFor } from "@testing-library/angular"

import { ColorPickerModule } from "./colorPicker.module"

describe("colorPicker", () => {
	@Component({
		selector: "test-color-picker",
		template: `
			<cc-color-picker
				[hexColor]="hexColor"
				(onColorChange)="hexColor = $event"
				[triggerTemplate]="colorPickerTriggerTemplate"
			></cc-color-picker>
			<ng-template #colorPickerTriggerTemplate let-isOpen="isOpen" let-isHovered="isHovered">
				<div>isOpen: {{ isOpen }}</div>
				<div>isHovered: {{ isHovered }}</div>
				<div>color: {{ hexColor }}</div>
			</ng-template>
		`
	})
	class TestColorPicker {
		hexColor = "#ffffff"
	}

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [ColorPickerModule]
		})
	})

	it("should let a user change a color within a menu", async () => {
		const { container } = await render(TestColorPicker)

		expectColorPickerInDom(false)
		expect(screen.queryByText("isOpen: false")).toBeTruthy()
		expect(screen.queryByText("color: #ffffff")).toBeTruthy()

		fireEvent.click(container.querySelector("cc-color-picker"))
		expectColorPickerInDom(true)
		expect(screen.queryByText("isOpen: true")).toBeTruthy()

		// @ts-ignore
		ng.getComponent(screen.queryByRole("colorpicker")).onChangeComplete.emit({
			$event: {},
			color: { hex: "#000000" }
		})
		expect(await screen.findByText("color: #000000")).toBeTruthy()

		fireEvent.click(document)
		await waitFor(() => expectColorPickerInDom(false))
		expect(screen.queryByText("isOpen: false")).toBeTruthy()
	})

	it("should pass `isHovered` into template", async () => {
		const { container } = await render(TestColorPicker)
		const colorPicker = container.querySelector("cc-color-picker")

		expect(screen.queryByText("isHovered: false")).toBeTruthy()

		fireEvent.mouseEnter(colorPicker)
		expect(screen.queryByText("isHovered: true")).toBeTruthy()

		fireEvent.mouseLeave(colorPicker)
		expect(screen.queryByText("isHovered: false")).toBeTruthy()
	})

	function expectColorPickerInDom(isOpen: boolean) {
		const colorPickerElement = screen.queryByRole("colorpicker")
		if (isOpen) {
			expect(colorPickerElement).not.toBe(null)
		} else {
			expect(colorPickerElement).toBe(null)
		}
	}
})
