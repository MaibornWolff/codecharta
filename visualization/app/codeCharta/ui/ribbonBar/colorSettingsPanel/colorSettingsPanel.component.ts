import { Component, ViewEncapsulation } from "@angular/core"
import { colorLabelOptions, ColorMode } from "../../../codeCharta.model"
import { Store } from "../../../state/angular-redux/store"
import { isDeltaStateSelector } from "../../../state/selectors/isDeltaState.selector"
import { setColorMode } from "../../../state/store/dynamicSettings/colorMode/colorMode.actions"
import { colorModeSelector } from "../../../state/store/dynamicSettings/colorMode/colorMode.selector"
import { colorLabelsSelector } from "../../../state/store/appSettings/colorLabels/colorLabels.selector"
import { MatLegacyCheckboxChange as MatCheckboxChange } from "@angular/material/legacy-checkbox"
import { setColorLabels } from "../../../state/store/appSettings/colorLabels/colorLabels.actions"
import { invertColorRange, invertDeltaColors } from "../../../state/store/appSettings/mapColors/mapColors.actions"

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

	constructor(private store: Store) {}

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
