import "./labelledColorPicker.component.scss"
import { Component, EventEmitter, Input, Output } from "@angular/core"

@Component({
	selector: "cc-labelled-color-picker",
	template: require("./labelledColorPicker.component.html")
})
export class LabelledColorPickerComponent {
	@Input() hexColor: string
	@Input() labels: string[]

	@Output() onColorChange = new EventEmitter<string>()

	handleColorChange(hexColor: string) {
		this.onColorChange.emit(hexColor)
	}
}
