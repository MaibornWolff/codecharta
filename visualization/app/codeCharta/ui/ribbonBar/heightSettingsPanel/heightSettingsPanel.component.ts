import "./heightSettingsPanel.component.scss"

import { Component, Inject } from "@angular/core"
import { Store } from "../../../state/angular-redux/store"
import { amountOfTopLabelsSelector } from "../../../state/store/appSettings/amountOfTopLabels/amountOfTopLabels.selector"
import { isLabelsSliderDisabledSelector } from "./selectors/isLabelsSliderDisabled.selector"
import { debounce } from "lodash"
import { setAmountOfTopLabels } from "../../../state/store/appSettings/amountOfTopLabels/amountOfTopLabels.actions"

@Component({
	selector: "cc-height-settings-panel",
	template: require("./heightSettingsPanel.component.html")
})
export class HeightSettingsPanelComponent {
	static DEBOUNCE_TIME = 400

	amountOfTopLabels$ = this.store.select(amountOfTopLabelsSelector)
	isLabelsSliderDisabled$ = this.store.select(isLabelsSliderDisabledSelector)

	applyDebouncedTopLabels = debounce((amountOfTopLabels: number) => {
		this.store.dispatch(setAmountOfTopLabels(amountOfTopLabels))
	}, HeightSettingsPanelComponent.DEBOUNCE_TIME)

	constructor(@Inject(Store) private store: Store) {}
}
