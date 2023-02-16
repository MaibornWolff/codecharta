import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { drag } from "../../util/testUtils/drag"
import { SliderComponent } from "./slider.component"
import { SliderModule } from "./slider.module"

describe("SliderComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [SliderModule]
		})
	})

	it("should update given value on input changes", async () => {
		let value = 21
		await render(SliderComponent, {
			excludeComponentDeclaration: true,
			componentProperties: {
				value,
				onChange: (newValue: number) => {
					value = newValue
				},
				min: 1,
				max: 100
			}
		})

		const inputField = screen.getByRole("spinbutton") as HTMLInputElement
		await userEvent.type(inputField, "42", { initialSelectionStart: 0, initialSelectionEnd: 2 })

		expect(value).toBe(42)
	})

	it("should update given value on slider changes", async () => {
		let value = 21
		const { container } = await render(SliderComponent, {
			excludeComponentDeclaration: true,
			componentProperties: {
				value,
				onChange: (newValue: number) => {
					value = newValue
				},
				min: 1,
				max: 100
			}
		})

		const sliderThumb = container.querySelector(".mdc-slider__thumb-knob")
		await drag(sliderThumb, {
			delta: { x: -100, y: 0 }
		})

		expect(value).toBe(1)
	})
})
