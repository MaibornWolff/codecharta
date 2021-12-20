import "./legendPanel.component.scss"
import { Component, Inject } from "@angular/core"
import { Observable } from "rxjs"

import { Store } from "../../state/angular-redux/store"
import { isDeltaStateSelector } from "../../state/selectors/isDeltaState.selector"
import { isAttributeSideBarVisibleSelector } from "../../state/store/appSettings/isAttributeSideBarVisible/isAttributeSideBarVisible.selector"
import { LegendMetric } from "./selectors/legendMetric"
import { legendColorMetricSelector } from "./selectors/legendColorMetric.selector"
import { legendHeightMetricSelector } from "./selectors/legendHeightMetric.selector"
import { legendAreaMetricSelector } from "./selectors/legendAreaMetric.selector"
import { legendEdgeMetricSelector } from "./selectors/legendEdgeMetric.selector"

@Component({
	selector: "cc-legend-panel",
	template: require("./legendPanel.component.html")
})
export class LegendPanelComponent {
	isLegendVisible = false
	isDeltaState$: Observable<boolean>
	isAttributeSideBarVisible$: Observable<boolean>
	heightMetric$: Observable<LegendMetric>
	areaMetric$: Observable<LegendMetric>
	colorMetric$: Observable<LegendMetric>
	edgeMetric$: Observable<LegendMetric | undefined>

	constructor(@Inject(Store) store: Store) {
		this.isAttributeSideBarVisible$ = store.select(isAttributeSideBarVisibleSelector)
		this.isDeltaState$ = store.select(isDeltaStateSelector)
		this.heightMetric$ = store.select(legendHeightMetricSelector)
		this.areaMetric$ = store.select(legendAreaMetricSelector)
		this.colorMetric$ = store.select(legendColorMetricSelector)
		this.edgeMetric$ = store.select(legendEdgeMetricSelector)
	}

	toggleIsLegendVisible() {
		this.isLegendVisible = !this.isLegendVisible
	}
}
