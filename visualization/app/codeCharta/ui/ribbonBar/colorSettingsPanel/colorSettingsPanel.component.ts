import { Component } from "@angular/core"
import { MatCheckbox } from "@angular/material/checkbox"
import { State, Store } from "@ngrx/store"
import { map } from "rxjs"
import { CcState, ColorMode, ColorRange } from "../../../codeCharta.model"
import { selectedColorMetricDataSelector } from "../../../state/selectors/accumulatedData/metricData/selectedColorMetricData.selector"
import { isDeltaStateSelector } from "../../../state/selectors/isDeltaState.selector"
import { invertColorRange, invertDeltaColors } from "../../../state/store/appSettings/mapColors/mapColors.actions"
import { colorMetricSelector } from "../../../state/store/dynamicSettings/colorMetric/colorMetric.selector"
import { setColorMode } from "../../../state/store/dynamicSettings/colorMode/colorMode.actions"
import { colorModeSelector } from "../../../state/store/dynamicSettings/colorMode/colorMode.selector"
import { calculateInitialColorRange } from "../../../state/store/dynamicSettings/colorRange/calculateInitialColorRange"
import { setColorRange } from "../../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { debounce } from "../../../util/debounce"
import { HandleValueChange, MetricColorRangeSliderComponent } from "./metricColorRangeSlider/metricColorRangeSlider.component"
import { metricColorRangeColorsSelector } from "./selectors/metricColorRangeColors.selector"
import { metricColorRangeValuesSelector } from "./selectors/metricColorRangeValues.selector"
import { ResetSettingsButtonComponent } from "../../resetSettingsButton/resetSettingsButton.component"
import { MetricColorRangeDiagramComponent } from "./metricColorRangeDiagram/metricColorRangeDiagram.component"
import { ColorPickerForMapColorComponent } from "../../colorPickerForMapColor/colorPickerForMapColor.component"
import { AsyncPipe } from "@angular/common"

@Component({
    selector: "cc-color-settings-panel",
    templateUrl: "./colorSettingsPanel.component.html",
    styleUrls: ["./colorSettingsPanel.component.scss"],
    imports: [
        MetricColorRangeSliderComponent,
        ResetSettingsButtonComponent,
        MetricColorRangeDiagramComponent,
        ColorPickerForMapColorComponent,
        MatCheckbox,
        AsyncPipe
    ]
})
export class ColorSettingsPanelComponent {
    static readonly DEBOUNCE_TIME = 400

    colorMode$ = this.store.select(colorModeSelector)
    colorMetric$ = this.store.select(colorMetricSelector)
    isDeltaState$ = this.store.select(isDeltaStateSelector)
    sliderValues$ = this.store.select(metricColorRangeValuesSelector)
    sliderColors$ = this.store.select(metricColorRangeColorsSelector)
    isAttributeDirectionInversed$ = this.checkIsAttributeDirectionReversed()
    isColorRangeInverted = false
    areDeltaColorsInverted = false

    constructor(
        private store: Store<CcState>,
        private state: State<CcState>
    ) {}

    handleValueChange: HandleValueChange = ({ newLeftValue, newRightValue }) => {
        this.updateColorRangeDebounced(newLeftValue, newRightValue)
    }

    private checkIsAttributeDirectionReversed() {
        return this.colorMetric$.pipe(
            map(colorMetric => {
                const attributeDescriptors = this.state.getValue().fileSettings.attributeDescriptors
                return attributeDescriptors[colorMetric]?.direction === 1
            })
        )
    }

    private updateColorRangeDebounced = (() => {
        let pendingLeftValue: null | number = null
        let pendingRightValue: null | number = null

        const flush = debounce(() => {
            const newColorRange: Partial<ColorRange> = {}
            if (pendingLeftValue !== null) {
                newColorRange.from = pendingLeftValue
            }
            if (pendingRightValue !== null) {
                newColorRange.to = pendingRightValue
            }
            this.store.dispatch(setColorRange({ value: newColorRange }))

            pendingLeftValue = null
            pendingRightValue = null
        }, ColorSettingsPanelComponent.DEBOUNCE_TIME)

        return (newLeftValue: number | undefined, newRightValue: number | undefined) => {
            pendingLeftValue = newLeftValue ?? pendingLeftValue
            pendingRightValue = newRightValue ?? pendingRightValue
            flush()
        }
    })()

    handleColorModeChange(gradient: ColorMode) {
        this.store.dispatch(setColorMode({ value: gradient }))
    }

    handleIsColorRangeInvertedChange(isColorRangeInverted: boolean) {
        this.isColorRangeInverted = isColorRangeInverted
        this.store.dispatch(invertColorRange())
    }

    handleAreDeltaColorsInverted(areDeltaColorsInverted: boolean) {
        this.areDeltaColorsInverted = areDeltaColorsInverted
        this.store.dispatch(invertDeltaColors())
    }

    resetInvertColorCheckboxes = () => {
        this.isColorRangeInverted = false
        this.areDeltaColorsInverted = false
    }

    resetColorRange = () => {
        const selectedColorMetricData = selectedColorMetricDataSelector(this.state.getValue())
        this.store.dispatch(setColorRange({ value: calculateInitialColorRange(selectedColorMetricData) }))
    }
}
