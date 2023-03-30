import { Component, ViewEncapsulation } from "@angular/core"
import { isDeltaStateSelector } from "../../state/selectors/isDeltaState.selector"
import { legendColorMetricSelector } from "./selectors/legendColorMetric.selector"
import { legendHeightMetricSelector } from "./selectors/legendHeightMetric.selector"
import { legendAreaMetricSelector } from "./selectors/legendAreaMetric.selector"
import { legendEdgeMetricSelector } from "./selectors/legendEdgeMetric.selector"
import { IsAttributeSideBarVisibleService } from "../../services/isAttributeSideBarVisible.service"
import { Store } from "@ngrx/store"
import { State } from "../../codeCharta.model"

@Component({
	selector: "cc-legend-panel",
	templateUrl: "./legendPanel.component.html",
	styleUrls: ["./legendPanel.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class LegendPanelComponent {
	isLegendVisible = false
	isDeltaState$ = this.store.select(isDeltaStateSelector)
	heightMetric$ = this.store.select(legendHeightMetricSelector)
	areaMetric$ = this.store.select(legendAreaMetricSelector)
	colorMetric$ = this.store.select(legendColorMetricSelector)
	edgeMetric$ = this.store.select(legendEdgeMetricSelector)

	constructor(public isAttributeSideBarVisibleService: IsAttributeSideBarVisibleService, private store: Store<State>) {}

	toggleIsLegendVisible() {
		this.isLegendVisible = !this.isLegendVisible
	}
}
