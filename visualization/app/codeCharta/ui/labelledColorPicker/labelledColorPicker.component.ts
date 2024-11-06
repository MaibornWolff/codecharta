import { Component, EventEmitter, Input, Output } from "@angular/core"
import { ColorPickerComponent } from "../colorPicker/colorPicker.component"
import { ReadableColorForBackgroundPipe } from "./readableColorForBackground.pipe"

@Component({
    selector: "cc-labelled-color-picker",
    templateUrl: "./labelledColorPicker.component.html",
    styleUrls: ["./labelledColorPicker.component.scss"],
    standalone: true,
    imports: [ColorPickerComponent, ReadableColorForBackgroundPipe]
})
export class LabelledColorPickerComponent {
    @Input() hexColor: string
    @Input() labels: string[]

    @Output() onColorChange = new EventEmitter<string>()

    handleColorChange(hexColor: string) {
        this.onColorChange.emit(hexColor)
    }
}
