import { Component, EventEmitter, Input, Output } from "@angular/core"

@Component({
	selector: "cc-color-picker",
	template: require("./colorPicker.component.html")
})
export class ColorPickerComponent {
	@Input() hexColor: string

	@Output() onColorChange = new EventEmitter<string>()

	handleChangeComplete(hexColor: string) {
		this.onColorChange.emit(hexColor)
	}
}
