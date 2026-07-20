import { ChangeDetectionStrategy, Component, input, OnDestroy, output } from "@angular/core"
import { debounce } from "../../../../util/debounce"
import { SETTINGS_INPUT_DEBOUNCE_MS } from "../../util/settingsInput"

/**
 * Linked range slider + number input shared by the metrics-bar settings popovers.
 *
 * Values are rounded to `step` and clamped to [min, max] before being emitted,
 * debounced by SETTINGS_INPUT_DEBOUNCE_MS. The number field is never overwritten
 * while the user is typing (intermediate values may be out of range); it is
 * normalized on change (blur/Enter), which also flushes the pending value.
 */
@Component({
    selector: "cc-slider-number-input",
    templateUrl: "./sliderNumberInput.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" }
})
export class SliderNumberInputComponent implements OnDestroy {
    readonly ariaLabel = input.required<string>()
    readonly min = input.required<number>()
    readonly max = input.required<number>()
    readonly step = input(1)
    readonly value = input.required<number>()
    readonly disabled = input(false)
    readonly valueChange = output<number>()

    private scheduledValue: number | undefined
    private readonly emitValueDebounced = debounce((value: number) => {
        this.scheduledValue = undefined
        this.valueChange.emit(value)
    }, SETTINGS_INPUT_DEBOUNCE_MS)

    ngOnDestroy(): void {
        this.emitValueDebounced.flush()
    }

    handleInput(event: Event) {
        const value = this.parseAndNormalize((event.target as HTMLInputElement).value)
        if (value === undefined) {
            return
        }
        if (value === this.value()) {
            // typed back to the committed value: drop the pending intermediate instead of committing it
            this.scheduledValue = undefined
            this.emitValueDebounced.cancel()
            return
        }
        // re-arm on every keystroke (even when the value matches the pending one):
        // the user is still typing, so the commit must keep moving out
        this.scheduledValue = value
        this.emitValueDebounced(value)
    }

    handleNumberChange(event: Event) {
        const input = event.target as HTMLInputElement
        const value = this.parseAndNormalize(input.value)
        const fallback = this.scheduledValue ?? this.value()
        this.emitValueDebounced.flush()
        input.value = String(value ?? fallback)
    }

    private parseAndNormalize(rawValue: string): number | undefined {
        const parsed = Number.parseFloat(rawValue)
        if (Number.isNaN(parsed)) {
            return undefined
        }
        const stepped = roundToStep(parsed, this.step())
        return Math.min(Math.max(stepped, this.min()), this.max())
    }
}

function roundToStep(value: number, step: number): number {
    if (step <= 0) {
        return value
    }
    // toPrecision avoids floating point artifacts like 0.30000000000000004 for fractional steps
    return Number((Math.round(value / step) * step).toPrecision(12))
}
