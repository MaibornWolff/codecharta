import { Component, computed, EventEmitter, input, Input, Output } from "@angular/core"
import { ColorPickerComponent } from "../colorPicker/colorPicker.component"
import { ReadableColorForBackgroundPipe } from "./readableColorForBackground.pipe"

@Component({
    selector: "cc-labelled-color-picker",
    templateUrl: "./labelledColorPicker.component.html",
    styleUrls: ["./labelledColorPicker.component.scss"],
    imports: [ColorPickerComponent, ReadableColorForBackgroundPipe]
})
export class LabelledColorPickerComponent {
    @Input() hexColor: string
    labels = input.required<string[]>()
    labelsToTrackByName = computed(() =>
        this.labels().map(it => {
            return {
                name: it
            }
        })
    )
    @Output()
    onColorChange = new EventEmitter<string>()

    handleColorChange(hexColor: string) {
        this.onColorChange.emit(hexColor)
    }
}
