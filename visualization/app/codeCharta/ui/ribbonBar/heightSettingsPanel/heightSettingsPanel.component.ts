import "./heightSettingsPanel.component.scss"

import { Component, Inject } from "@angular/core"
import { Store } from "../../../state/angular-redux/store"
import { amountOfTopLabelsSelector } from "../../../state/store/appSettings/amountOfTopLabels/amountOfTopLabels.selector"
import { isLabelsSliderDisabledSelector } from "./selectors/isLabelsSliderDisabled.selector"
import { debounce } from "lodash"
import { setAmountOfTopLabels } from "../../../state/store/appSettings/amountOfTopLabels/amountOfTopLabels.actions"
import { showMetricLabelNodeNameSelector } from "../../../state/store/appSettings/showMetricLabelNodeName/showMetricLabelNodeName.selector"
import { showMetricLabelNodeValueSelector } from "../../../state/store/appSettings/showMetricLabelNameValue/showMetricLabelNameValue.selector"
import { MatCheckboxChange } from "@angular/material/checkbox"
import { setShowMetricLabelNodeName } from "../../../state/store/appSettings/showMetricLabelNodeName/showMetricLabelNodeName.actions"
import { setShowMetricLabelNameValue } from "../../../state/store/appSettings/showMetricLabelNameValue/showMetricLabelNameValue.actions"
import { scalingSelector } from "../../../state/store/appSettings/scaling/scaling.selector"
import { setScaling } from "../../../state/store/appSettings/scaling/scaling.actions"
import { invertHeightSelector } from "../../../state/store/appSettings/invertHeight/invertHeight.selector"
import { setInvertHeight } from "../../../state/store/appSettings/invertHeight/invertHeight.actions"
import { isDeltaStateSelector } from "../../../state/selectors/isDeltaState.selector"

@Component({
	selector: "cc-height-settings-panel",
	template: require("./heightSettingsPanel.component.html")
})
export class HeightSettingsPanelComponent {
	static DEBOUNCE_TIME = 400

	amountOfTopLabels$ = this.store.select(amountOfTopLabelsSelector)
	isLabelsSliderDisabled$ = this.store.select(isLabelsSliderDisabledSelector)
	showMetricLabelNodeName$ = this.store.select(showMetricLabelNodeNameSelector)
	showMetricLabelNodeValue$ = this.store.select(showMetricLabelNodeValueSelector)
	scaling$ = this.store.select(scalingSelector)
	invertHeight$ = this.store.select(invertHeightSelector)
	isDeltaState$ = this.store.select(isDeltaStateSelector)
	topLabels

	constructor(@Inject(Store) private store: Store) {}

	applyDebouncedTopLabels = debounce((amountOfTopLabels: number) => {
		this.store.dispatch(setAmountOfTopLabels(amountOfTopLabels))
	}, HeightSettingsPanelComponent.DEBOUNCE_TIME)

	applyDebouncedScalingY = debounce((y: number) => {
		this.store.dispatch(setScaling({ y }))
	}, HeightSettingsPanelComponent.DEBOUNCE_TIME)

	setShowMetricLabelNodeName(event: MatCheckboxChange) {
		this.store.dispatch(setShowMetricLabelNodeName(event.checked))
	}

	setShowMetricLabelNameValue(event: MatCheckboxChange) {
		this.store.dispatch(setShowMetricLabelNameValue(event.checked))
	}

	setInvertHeight(event: MatCheckboxChange) {
		this.store.dispatch(setInvertHeight(event.checked))
	}
}
