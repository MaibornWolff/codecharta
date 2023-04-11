import { Component, ViewEncapsulation } from "@angular/core"
import { ColorLabelOptions, ColorMode, CcState } from "../../../codeCharta.model"
import { isDeltaStateSelector } from "../../../state/selectors/isDeltaState.selector"
import { setColorMode } from "../../../state/store/dynamicSettings/colorMode/colorMode.actions"
import { colorModeSelector } from "../../../state/store/dynamicSettings/colorMode/colorMode.selector"
import { colorLabelsSelector } from "../../../state/store/appSettings/colorLabels/colorLabels.selector"
import { MatCheckboxChange } from "@angular/material/checkbox"
import { setColorLabels } from "../../../state/store/appSettings/colorLabels/colorLabels.actions"
import { invertColorRange, invertDeltaColors } from "../../../state/store/appSettings/mapColors/mapColors.actions"
import { Store, State as StateService } from "@ngrx/store"
import { selectedColorMetricDataSelector } from "../../../state/selectors/accumulatedData/metricData/selectedColorMetricData.selector"
import { setColorRange } from "../../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { calculateInitialColorRange } from "../../../state/store/dynamicSettings/colorRange/calculateInitialColorRange"

@Component({
	selector: "cc-color-settings-panel",
	templateUrl: "./colorSettingsPanel.component.html",
	styleUrls: ["./colorSettingsPanel.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class ColorSettingsPanelComponent {
	isDeltaState$ = this.store.select(isDeltaStateSelector)
	colorMode$ = this.store.select(colorModeSelector)
	colorLabels$ = this.store.select(colorLabelsSelector)
	isColorRangeInverted = false
	areDeltaColorsInverted = false

	constructor(private store: Store<CcState>, private stateService: StateService<CcState>) {}

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
		const selectedColorMetricData = selectedColorMetricDataSelector(this.stateService.getValue())
		this.store.dispatch(setColorRange({ value: calculateInitialColorRange(selectedColorMetricData) }))
	}
}
