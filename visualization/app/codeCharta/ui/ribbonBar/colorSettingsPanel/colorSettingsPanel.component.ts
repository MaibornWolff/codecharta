import "./colorSettingsPanel.component.scss"
import { Component, Inject } from "@angular/core"
import { colorLabelOptions, ColorMode } from "../../../codeCharta.model"
import { Store } from "../../../state/angular-redux/store"
import { isDeltaStateSelector } from "../../../state/selectors/isDeltaState.selector"
import { setColorMode } from "../../../state/store/dynamicSettings/colorMode/colorMode.actions"
import { colorModeSelector } from "../../../state/store/dynamicSettings/colorMode/colorMode.selector"
import { colorLabelsSelector } from "../../../state/store/appSettings/colorLabels/colorLabels.selector"
import { MatCheckboxChange } from "@angular/material/checkbox"
import { setColorLabels } from "../../../state/store/appSettings/colorLabels/colorLabels.actions"
import { invertColorRange, invertDeltaColors } from "../../../state/store/appSettings/mapColors/mapColors.actions"

@Component({
	selector: "cc-color-settings-panel",
	template: require("./colorSettingsPanel.component.html")
})
export class ColorSettingsPanelComponent {
	isDeltaState$ = this.store.select(isDeltaStateSelector)
	colorMode$ = this.store.select(colorModeSelector)
	colorLabels$ = this.store.select(colorLabelsSelector)
	isColorRangeInverted = false
	areDeltaColorsInverted = false

	constructor(@Inject(Store) private store: Store) {}

	handleColorModeChange(gradient: ColorMode) {
		this.store.dispatch(setColorMode(gradient))
	}

	toggleColorLabel(change: MatCheckboxChange, colorLabelToToggle: keyof colorLabelOptions) {
		this.store.dispatch(setColorLabels({ [colorLabelToToggle]: change.checked }))
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
}
