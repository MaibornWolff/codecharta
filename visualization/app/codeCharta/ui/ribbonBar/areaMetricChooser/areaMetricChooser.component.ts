import { Component, ViewEncapsulation } from "@angular/core"
import { Store } from "@ngrx/store"
import { State } from "../../../codeCharta.model"
import { setAreaMetric } from "../../../state/store/dynamicSettings/areaMetric/areaMetric.actions"
import { areaMetricSelector } from "../../../state/store/dynamicSettings/areaMetric/areaMetric.selector"

@Component({
	selector: "cc-area-metric-chooser",
	templateUrl: "./areaMetricChooser.component.html",
	encapsulation: ViewEncapsulation.None
})
export class AreaMetricChooserComponent {
	areaMetric$ = this.store.select(areaMetricSelector)

	constructor(private store: Store<State>) {}

	handleAreaMetricChanged(value: string) {
		this.store.dispatch(setAreaMetric({ value }))
	}
}
