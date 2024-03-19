import { Component, ViewEncapsulation } from "@angular/core"
import { MatCheckboxChange } from "@angular/material/checkbox"
import { State, Store } from "@ngrx/store"
import { map } from "rxjs"
import { CcState, ColorLabelOptions, ColorMode, ColorRange } from "../../../codeCharta.model"
import { selectedColorMetricDataSelector } from "../../../state/selectors/accumulatedData/metricData/selectedColorMetricData.selector"
import { isDeltaStateSelector } from "../../../state/selectors/isDeltaState.selector"
import { setColorLabels } from "../../../state/store/appSettings/colorLabels/colorLabels.actions"
import { colorLabelsSelector } from "../../../state/store/appSettings/colorLabels/colorLabels.selector"
import { invertColorRange, invertDeltaColors } from "../../../state/store/appSettings/mapColors/mapColors.actions"
import { colorMetricSelector } from "../../../state/store/dynamicSettings/colorMetric/colorMetric.selector"
import { setColorMode } from "../../../state/store/dynamicSettings/colorMode/colorMode.actions"
import { colorModeSelector } from "../../../state/store/dynamicSettings/colorMode/colorMode.selector"
import { calculateInitialColorRange } from "../../../state/store/dynamicSettings/colorRange/calculateInitialColorRange"
import { setColorRange } from "../../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { debounce } from "../../../util/debounce"
import { HandleValueChange } from "./metricColorRangeSlider/metricColorRangeSlider.component"
import { metricColorRangeColorsSelector } from "./selectors/metricColorRangeColors.selector"
import { metricColorRangeValuesSelector } from "./selectors/metricColorRangeValues.selector"

@Component({
	selector: "cc-color-settings-panel",
	templateUrl: "./colorSettingsPanel.component.html",
	styleUrls: ["./colorSettingsPanel.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class ColorSettingsPanelComponent {
	colorMode$ = this.store.select(colorModeSelector)
	colorLabels$ = this.store.select(colorLabelsSelector)
	colorMetric$ = this.store.select(colorMetricSelector)
	isDeltaState$ = this.store.select(isDeltaStateSelector)
	sliderValues$ = this.store.select(metricColorRangeValuesSelector)
	sliderColors$ = this.store.select(metricColorRangeColorsSelector)
	isAttributeDescriptionInversed$ = this.checkIsAttributeDirectionReversed()
	isColorRangeInverted = false
	areDeltaColorsInverted = false

	private newLeftValue: null | number = null
	private newRightValue: null | number = null
	isAttributeDirectionInversed: boolean

	constructor(private store: Store<CcState>, private state: State<CcState>) {}

	handleValueChange: HandleValueChange = ({ newLeftValue, newRightValue }) => {
		this.newLeftValue = newLeftValue ?? this.newLeftValue
		this.newRightValue = newRightValue ?? this.newRightValue
		this.updateColorRangeDebounced()
	}

	private checkIsAttributeDirectionReversed() {
		return this.colorMetric$.pipe(
			map(colorMetric => {
				const attributeDescriptors = this.state.getValue().fileSettings.attributeDescriptors
				return attributeDescriptors[colorMetric]?.direction === 1 ? true : false
			})
		)
	}

	private updateColorRangeDebounced = debounce(() => {
		const newColorRange: Partial<ColorRange> = {}
		if (this.newLeftValue !== null) {
			newColorRange.from = this.newLeftValue
		}
		if (this.newRightValue !== null) {
			newColorRange.to = this.newRightValue
		}
		this.store.dispatch(setColorRange({ value: newColorRange }))

		this.newLeftValue = null
		this.newRightValue = null
	}, 400)

	handleColorModeChange(gradient: ColorMode) {
		this.store.dispatch(setColorMode({ value: gradient }))
	}

	toggleColorLabel(change: MatCheckboxChange, colorLabelToToggle: keyof ColorLabelOptions) {
		this.store.dispatch(setColorLabels({ value: { [colorLabelToToggle]: change.checked } }))
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
