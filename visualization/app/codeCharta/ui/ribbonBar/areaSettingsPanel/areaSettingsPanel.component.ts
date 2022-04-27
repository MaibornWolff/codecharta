import { Component, Inject } from "@angular/core"
import "./areaSettingsPanel.component.scss"
import { Store } from "../../../state/angular-redux/store"
import { marginSelector } from "../../../state/store/dynamicSettings/margin/margin.selector"
import { debounce } from "lodash"
import { setMargin } from "../../../state/store/dynamicSettings/margin/margin.actions"
import { dynamicMarginSelector } from "../../../state/store/appSettings/dynamicMargin/dynamicMargin.selector"
import { setDynamicMargin } from "../../../state/store/appSettings/dynamicMargin/dynamicMargin.actions"
import { MatCheckboxChange } from "@angular/material/checkbox"

@Component({
	selector: "cc-area-settings-panel",
	template: require("./areaSettingsPanel.component.html")
})
export class AreaSettingsPanelComponent {
	// TODO: onFilesSelectionChanged() {
	//     this._viewModel.dynamicMargin = true
	//     this.applyDynamicMargin()
	//   }

	static DEBOUNCE_TIME = 400

	margin$ = this.store.select(marginSelector)
	dynamicMargin$ = this.store.select(dynamicMarginSelector)

	applyDebouncedMargin = debounce((margin: number) => {
		this.store.dispatch(setMargin(margin))
		this.store.dispatch(setDynamicMargin(false))
	}, AreaSettingsPanelComponent.DEBOUNCE_TIME)

	constructor(@Inject(Store) private store: Store) {}

	setDynamicMargin($event: MatCheckboxChange) {
		this.store.dispatch(setDynamicMargin($event.checked))
	}
}
