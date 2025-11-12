import { Component, computed, input, output } from "@angular/core"
import { ColorPickerComponent } from "../colorPicker/colorPicker.component"
import { ReadableColorForBackgroundPipe } from "./readableColorForBackground.pipe"

@Component({
    selector: "cc-labelled-color-picker",
    templateUrl: "./labelledColorPicker.component.html",
    styleUrls: ["./labelledColorPicker.component.scss"],
    imports: [ColorPickerComponent, ReadableColorForBackgroundPipe]
})
export class LabelledColorPickerComponent {
    hexColor = input.required<string>()
    labels = input.required<string[]>()
    labelsToTrackByName = computed(() =>
        this.labels().map(it => {
            return {
                name: it
            }
        })
    )
    colorChange = output<string>()

    handleColorChange(hexColor: string) {
        this.colorChange.emit(hexColor)
    }
}
