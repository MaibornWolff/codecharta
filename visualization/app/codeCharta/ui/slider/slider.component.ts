import { Component, Input } from "@angular/core"
import { parseNumberInput } from "../../util/parseNumberInput"

@Component({
    selector: "cc-slider",
    templateUrl: "./slider.component.html",
    styleUrls: ["./slider.component.scss"]
})
export class SliderComponent {
    @Input() value?: number
    @Input() min: number
    @Input() max: number
    @Input() label: string
    @Input() step?: number = 1
    @Input() disabled?: boolean = false
    @Input() onChange: (number) => void
    handleSliderOnChange(value: number) {
        if (value !== this.value) {
            this.onChange(value)
        }
    }

    handleInputOnChange($event: Event) {
        const newValue = parseNumberInput($event, this.min, this.max)
        if (newValue !== this.value && !Number.isNaN(newValue)) {
            this.onChange(newValue)
        }
    }
}
