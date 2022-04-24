import { Component, Input } from "@angular/core"
import { MatSliderChange } from "@angular/material/slider"

@Component({
	selector: "cc-slider",
	template: require("./slider.component.html")
})
export class SliderComponent {
	@Input() value: number
	@Input() step: number
	@Input() min: number
	@Input() max: number
	@Input() onChange: (number) => void

	handleOnChange($event: MatSliderChange) {
		console.log($event.value)
	}
}
