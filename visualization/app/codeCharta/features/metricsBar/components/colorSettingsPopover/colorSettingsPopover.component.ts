import { ChangeDetectionStrategy, Component, computed, input, OnDestroy } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { combineLatest, map } from "rxjs"
import { ColorMode, ColorRange } from "../../../../codeCharta.model"
import { defaultMapColors } from "../../../../state/store/appSettings/mapColors/mapColors.reducer"
import { calculateInitialColorRange } from "../../../../state/store/dynamicSettings/colorRange/calculateInitialColorRange"
import { ColorPickerForMapColorComponent } from "../../../../ui/colorPickerForMapColor/colorPickerForMapColor.component"
import { ResetSettingsButtonComponent } from "../../../../ui/resetSettingsButton/resetSettingsButton.component"
import { AttributeDescriptorsService } from "../../services/attributeDescriptors.service"
import { ColorMetricService } from "../../services/colorMetric.service"
import { ColorModeService } from "../../services/colorMode.service"
import { ColorRangeService } from "../../services/colorRange.service"
import { IsDeltaStateService } from "../../services/isDeltaState.service"
import { MapColorsService } from "../../services/mapColors.service"
import { SelectedColorMetricDataService } from "../../services/selectedColorMetricData.service"
import { SETTINGS_INPUT_DEBOUNCE_MS } from "../../util/settingsInput"
import { SettingsPopoverShellComponent } from "../settingsPopoverShell/settingsPopoverShell.component"
import { MetricColorRangeDiagramComponent } from "./metricColorRangeDiagram.component"
import { HandleValueChange, MetricColorRangeSliderComponent } from "./metricColorRangeSlider.component"

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
    constructor(
        private readonly colorModeService: ColorModeService,
        private readonly colorMetricService: ColorMetricService,
        private readonly isDeltaStateService: IsDeltaStateService,
        private readonly colorRangeService: ColorRangeService,
        private readonly attributeDescriptorsService: AttributeDescriptorsService,
        private readonly mapColorsService: MapColorsService,
        private readonly selectedColorMetricDataService: SelectedColorMetricDataService
    ) {}

    readonly popoverId = input.required<string>()
    readonly anchorName = input.required<string>()

    readonly colorMode = toSignal(this.colorModeService.colorMode$(), { initialValue: "absolute" as ColorMode })
    readonly colorMetric = toSignal(this.colorMetricService.colorMetric$(), { initialValue: "" })
    readonly isDeltaState = toSignal(this.isDeltaStateService.isDeltaState$(), { initialValue: false })
    readonly sliderValues = toSignal(this.colorRangeService.metricColorRangeValues$(), {
        initialValue: { values: [], min: 0, max: 0, from: 0, to: 0 }
    })
    readonly sliderColors = toSignal(this.colorRangeService.metricColorRangeColors$(), {
        initialValue: { leftColor: "#000", middleColor: "#000", rightColor: "#000" }
    })
    readonly isAttributeDirectionInversed = toSignal(
        combineLatest([this.colorMetricService.colorMetric$(), this.attributeDescriptorsService.attributeDescriptors$()]).pipe(
            map(([colorMetric, attributeDescriptors]) => attributeDescriptors[colorMetric]?.direction === 1)
        ),
        { initialValue: false }
    )

    readonly mapColors = toSignal(this.mapColorsService.mapColors$(), { initialValue: defaultMapColors })

    private readonly selectedColorMetricData = toSignal(this.selectedColorMetricDataService.selectedColorMetricData$(), {
        initialValue: { values: [] as number[], minValue: 0, maxValue: 0 }
    })

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
            this.colorRangeService.setColorRange(newColorRange)

            this.pendingLeftValue = null
            this.pendingRightValue = null
        }, SETTINGS_INPUT_DEBOUNCE_MS)
    }

    handleColorModeChange(value: string) {
        this.colorModeService.setColorMode(value as ColorMode)
    }

    handleIsColorRangeInvertedChange() {
        this.mapColorsService.invertColorRange()
    }

    handleAreDeltaColorsInvertedChange() {
        this.mapColorsService.invertDeltaColors()
    }

    resetColorRange = () => {
        this.colorRangeService.setColorRange(calculateInitialColorRange(this.selectedColorMetricData()))
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
