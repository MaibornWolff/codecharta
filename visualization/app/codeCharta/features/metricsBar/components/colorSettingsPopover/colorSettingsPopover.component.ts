import { ChangeDetectionStrategy, Component, computed, inject, input, OnDestroy } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { State, Store } from "@ngrx/store"
import { map } from "rxjs"
import { CcState, ColorMode, ColorRange } from "../../../../codeCharta.model"
import { selectedColorMetricDataSelector } from "../../../../state/selectors/accumulatedData/metricData/selectedColorMetricData.selector"
import { isDeltaStateSelector } from "../../../../state/selectors/isDeltaState.selector"
import { invertColorRange, invertDeltaColors } from "../../../../state/store/appSettings/mapColors/mapColors.actions"
import { defaultMapColors } from "../../../../state/store/appSettings/mapColors/mapColors.reducer"
import { mapColorsSelector } from "../../../../state/store/appSettings/mapColors/mapColors.selector"
import { colorMetricSelector } from "../../../../state/store/dynamicSettings/colorMetric/colorMetric.selector"
import { setColorMode } from "../../../../state/store/dynamicSettings/colorMode/colorMode.actions"
import { colorModeSelector } from "../../../../state/store/dynamicSettings/colorMode/colorMode.selector"
import { calculateInitialColorRange } from "../../../../state/store/dynamicSettings/colorRange/calculateInitialColorRange"
import { setColorRange } from "../../../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { ColorPickerForMapColorComponent } from "../../../../ui/colorPickerForMapColor/colorPickerForMapColor.component"
import { ResetSettingsButtonComponent } from "../../../../ui/resetSettingsButton/resetSettingsButton.component"
import { MetricColorRangeDiagramComponent } from "./metricColorRangeDiagram.component"
import { HandleValueChange, MetricColorRangeSliderComponent } from "./metricColorRangeSlider.component"
import { metricColorRangeColorsSelector } from "./selectors/metricColorRangeColors.selector"
import { metricColorRangeValuesSelector } from "./selectors/metricColorRangeValues.selector"
import { SETTINGS_INPUT_DEBOUNCE_MS } from "../../util/settingsInput"
import { SettingsPopoverShellComponent } from "../settingsPopoverShell/settingsPopoverShell.component"

@Component({
    selector: "cc-color-settings-popover",
    templateUrl: "./colorSettingsPopover.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [
        MetricColorRangeSliderComponent,
        MetricColorRangeDiagramComponent,
        ColorPickerForMapColorComponent,
        ResetSettingsButtonComponent,
        SettingsPopoverShellComponent
    ]
})
export class ColorSettingsPopoverComponent implements OnDestroy {
    private readonly store = inject(Store<CcState>)
    private readonly state = inject(State<CcState>)

    readonly popoverId = input.required<string>()
    readonly anchorName = input.required<string>()

    readonly colorMode = toSignal(this.store.select(colorModeSelector), { initialValue: "absolute" as ColorMode })
    readonly colorMetric = toSignal(this.store.select(colorMetricSelector), { initialValue: "" })
    readonly isDeltaState = toSignal(this.store.select(isDeltaStateSelector), { initialValue: false })
    readonly sliderValues = toSignal(this.store.select(metricColorRangeValuesSelector), {
        initialValue: { values: [], min: 0, max: 0, from: 0, to: 0 }
    })
    readonly sliderColors = toSignal(this.store.select(metricColorRangeColorsSelector), {
        initialValue: { leftColor: "#000", middleColor: "#000", rightColor: "#000" }
    })
    readonly isAttributeDirectionInversed = toSignal(
        this.store.select(colorMetricSelector).pipe(
            map(colorMetric => {
                const attributeDescriptors = this.state.getValue().fileSettings.attributeDescriptors
                return attributeDescriptors[colorMetric]?.direction === 1
            })
        ),
        { initialValue: false }
    )

    readonly mapColors = toSignal(this.store.select(mapColorsSelector), { initialValue: defaultMapColors })

    readonly isColorRangeInverted = computed(
        () => this.mapColors().positive === defaultMapColors.negative && this.mapColors().negative === defaultMapColors.positive
    )
    readonly areDeltaColorsInverted = computed(
        () =>
            this.mapColors().positiveDelta === defaultMapColors.negativeDelta &&
            this.mapColors().negativeDelta === defaultMapColors.positiveDelta
    )

    readonly isWidePopover = computed(() => !this.isDeltaState() && this.colorMetric() !== "unary")

    readonly resetThresholdsKeys = ["dynamicSettings.colorRange"]

    private pendingLeftValue: null | number = null
    private pendingRightValue: null | number = null
    private debounceTimer: ReturnType<typeof setTimeout> | null = null

    handleValueChange: HandleValueChange = ({ newLeftValue, newRightValue }) => {
        this.updateColorRangeDebounced(newLeftValue, newRightValue)
    }

    ngOnDestroy(): void {
        if (this.debounceTimer !== null) {
            clearTimeout(this.debounceTimer)
            this.debounceTimer = null
        }
    }

    private readonly updateColorRangeDebounced = (newLeftValue: number | undefined, newRightValue: number | undefined) => {
        this.pendingLeftValue = newLeftValue ?? this.pendingLeftValue
        this.pendingRightValue = newRightValue ?? this.pendingRightValue

        if (this.debounceTimer !== null) {
            clearTimeout(this.debounceTimer)
        }
        this.debounceTimer = setTimeout(() => {
            this.debounceTimer = null
            const newColorRange: Partial<ColorRange> = {}
            if (this.pendingLeftValue !== null) {
                newColorRange.from = this.pendingLeftValue
            }
            if (this.pendingRightValue !== null) {
                newColorRange.to = this.pendingRightValue
            }
            this.store.dispatch(setColorRange({ value: newColorRange }))

            this.pendingLeftValue = null
            this.pendingRightValue = null
        }, SETTINGS_INPUT_DEBOUNCE_MS)
    }

    handleColorModeChange(value: string) {
        this.store.dispatch(setColorMode({ value: value as ColorMode }))
    }

    handleIsColorRangeInvertedChange() {
        this.store.dispatch(invertColorRange())
    }

    handleAreDeltaColorsInvertedChange() {
        this.store.dispatch(invertDeltaColors())
    }

    resetColorRange = () => {
        const selectedColorMetricData = selectedColorMetricDataSelector(this.state.getValue())
        this.store.dispatch(setColorRange({ value: calculateInitialColorRange(selectedColorMetricData) }))
    }

    resetColorsKeys() {
        return this.isDeltaState()
            ? ["appSettings.mapColors.positiveDelta", "appSettings.mapColors.negativeDelta", "appSettings.mapColors.selected"]
            : [
                  "appSettings.mapColors.positive",
                  "appSettings.mapColors.negative",
                  "appSettings.mapColors.neutral",
                  "appSettings.mapColors.selected"
              ]
    }
}
