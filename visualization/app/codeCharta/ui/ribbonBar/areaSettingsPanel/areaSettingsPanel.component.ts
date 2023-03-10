import { Component, ViewEncapsulation } from "@angular/core"
import { Store } from "../../../state/angular-redux/store"
import { marginSelector } from "../../../state/store/dynamicSettings/margin/margin.selector"
import { setMargin } from "../../../state/store/dynamicSettings/margin/margin.actions"
import { MatCheckboxChange } from "@angular/material/checkbox"
import { setEnableFloorLabels } from "../../../state/store/appSettings/enableFloorLabels/enableFloorLabels.actions"
import { enableFloorLabelsSelector } from "../../../state/store/appSettings/enableFloorLabels/enableFloorLabels.selector"
import { invertAreaSelector } from "../../../state/store/appSettings/invertArea/invertArea.selector"
import { debounce } from "../../../util/debounce"
import { toggleInvertingArea } from "../../../state/store/appSettings/invertArea/invertArea.actions"

@Component({
	selector: "cc-area-settings-panel",
	templateUrl: "./areaSettingsPanel.component.html",
	styleUrls: ["./areaSettingsPanel.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class AreaSettingsPanelComponent {
	static DEBOUNCE_TIME = 400

	margin$ = this.store.select(marginSelector)
	enableFloorLabels$ = this.store.select(enableFloorLabelsSelector)
	isInvertedArea$ = this.store.select(invertAreaSelector)

	constructor(private store: Store) {}

	applyDebouncedMargin = debounce((margin: number) => {
		this.store.dispatch(setMargin(margin))
	}, AreaSettingsPanelComponent.DEBOUNCE_TIME)

	setEnableFloorLabel(event: MatCheckboxChange) {
		this.store.dispatch(setEnableFloorLabels(event.checked))
	}

	toggleInvertingArea() {
		this.store.dispatch(toggleInvertingArea())
	}
}
