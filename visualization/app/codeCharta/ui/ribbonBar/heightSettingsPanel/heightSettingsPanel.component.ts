import { Component, ViewEncapsulation } from "@angular/core"
import { amountOfTopLabelsSelector } from "../../../state/store/appSettings/amountOfTopLabels/amountOfTopLabels.selector"
import { isLabelsSliderDisabledSelector } from "./selectors/isLabelsSliderDisabled.selector"
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
import { debounce } from "../../../util/debounce"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"

@Component({
	selector: "cc-height-settings-panel",
	templateUrl: "./heightSettingsPanel.component.html",
	encapsulation: ViewEncapsulation.None
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

	constructor(private store: Store<CcState>) {}

	applyDebouncedTopLabels = debounce((amountOfTopLabels: number) => {
		this.store.dispatch(setAmountOfTopLabels({ value: amountOfTopLabels }))
	}, HeightSettingsPanelComponent.DEBOUNCE_TIME)

	applyDebouncedScalingY = debounce((y: number) => {
		this.store.dispatch(setScaling({ value: { y } }))
	}, HeightSettingsPanelComponent.DEBOUNCE_TIME)

	setShowMetricLabelNodeName(event: MatCheckboxChange) {
		this.store.dispatch(setShowMetricLabelNodeName({ value: event.checked }))
	}

	setShowMetricLabelNameValue(event: MatCheckboxChange) {
		this.store.dispatch(setShowMetricLabelNameValue({ value: event.checked }))
	}

	setInvertHeight(event: MatCheckboxChange) {
		this.store.dispatch(setInvertHeight({ value: event.checked }))
	}
}
