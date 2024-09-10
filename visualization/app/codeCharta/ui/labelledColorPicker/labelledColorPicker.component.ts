import { Component, EventEmitter, Input, Output } from "@angular/core"

@Component({
    selector: "cc-labelled-color-picker",
    templateUrl: "./labelledColorPicker.component.html",
    styleUrls: ["./labelledColorPicker.component.scss"]
})
export class LabelledColorPickerComponent {
    @Input() hexColor: string
    @Input() labels: string[]

    @Output() onColorChange = new EventEmitter<string>()

    handleColorChange(hexColor: string) {
        this.onColorChange.emit(hexColor)
    }
}
