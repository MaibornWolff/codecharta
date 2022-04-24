import "./slider.component.scss"
import { Component, Input } from "@angular/core"
import { MatSliderChange } from "@angular/material/slider"

@Component({
	selector: "cc-slider",
	template: require("./slider.component.html")
})
export class SliderComponent {
	@Input() value?: number
	@Input() min: number
	@Input() max: number
	@Input() step?: number = 1
	@Input() onChange: (number) => void

	handleSliderOnChange($event: MatSliderChange) {
		if ($event.value !== this.value) {
			this.onChange($event.value)
		}
	}

	handleInputOnChange($event: InputEvent) {
		const newValue = Number.parseInt(($event.target as HTMLInputElement).value)
		if (newValue !== this.value) {
			this.onChange(newValue)
		}
	}
}
