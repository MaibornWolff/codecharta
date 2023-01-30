import { Component, ViewEncapsulation } from "@angular/core"
import { Store } from "../../../state/angular-redux/store"
import { marginSelector } from "../../../state/store/dynamicSettings/margin/margin.selector"
import debounce from "lodash.debounce"
import { setMargin } from "../../../state/store/dynamicSettings/margin/margin.actions"
import { dynamicMarginSelector } from "../../../state/store/appSettings/dynamicMargin/dynamicMargin.selector"
import { setDynamicMargin } from "../../../state/store/appSettings/dynamicMargin/dynamicMargin.actions"
import { MatCheckboxChange } from "@angular/material/checkbox"
import { setEnableFloorLabels } from "../../../state/store/appSettings/enableFloorLabels/enableFloorLabels.actions"
import { enableFloorLabelsSelector } from "../../../state/store/appSettings/enableFloorLabels/enableFloorLabels.selector"

@Component({
	selector: "cc-area-settings-panel",
	templateUrl: "./areaSettingsPanel.component.html",
	styleUrls: ["./areaSettingsPanel.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class AreaSettingsPanelComponent {
	static DEBOUNCE_TIME = 400

	margin$ = this.store.select(marginSelector)
	dynamicMargin$ = this.store.select(dynamicMarginSelector)
	enableFloorLabels$ = this.store.select(enableFloorLabelsSelector)

	applyDebouncedMargin = debounce((margin: number) => {
		this.store.dispatch(setMargin(margin))
		this.store.dispatch(setDynamicMargin(false))
	}, AreaSettingsPanelComponent.DEBOUNCE_TIME)

	constructor(private store: Store) {}

	setDynamicMargin($event: MatCheckboxChange) {
		this.store.dispatch(setDynamicMargin($event.checked))
	}

	setEnableFloorLabel(event: MatCheckboxChange) {
		this.store.dispatch(setEnableFloorLabels(event.checked))
	}
}
