import { Component, input, output } from "@angular/core"
import { Vector3 } from "three"
import { Printer } from "../printerPresetSelection/printerPresetSelection.component"

@Component({
    selector: "cc-scale-slider",
    templateUrl: "./scaleSlider.component.html"
})
export class ScaleSliderComponent {
    currentSize = input.required<Vector3>()
    wantedWidth = input.required<number>()
    maxWidth = input.required<number>()
    selectedPrinter = input.required<Printer>()

    widthChanged = output<number>()

    handleSliderChange(event: Event) {
        const input = event.target as HTMLInputElement
        this.widthChanged.emit(Number(input.value))
    }
}
