import "./legendPanel.component.scss"
import { Component, Inject } from "@angular/core"
import { Store } from "../../state/angular-redux/store"
import { isDeltaStateSelector } from "../../state/selectors/isDeltaState.selector"
import { legendColorMetricSelector } from "./selectors/legendColorMetric.selector"
import { legendHeightMetricSelector } from "./selectors/legendHeightMetric.selector"
import { legendAreaMetricSelector } from "./selectors/legendAreaMetric.selector"
import { legendEdgeMetricSelector } from "./selectors/legendEdgeMetric.selector"
import { IsAttributeSideBarVisibleService } from "../../services/isAttributeSideBarVisible.service"
import { attributeDescriptorsSelector } from "../../state/store/fileSettings/attributeDescriptors/attributesDescriptors.selector"

@Component({
	selector: "cc-legend-panel",
	template: require("./legendPanel.component.html")
})
export class LegendPanelComponent {
	isLegendVisible = false
	isDeltaState$ = this.store.select(isDeltaStateSelector)
	heightMetric$ = this.store.select(legendHeightMetricSelector)
	areaMetric$ = this.store.select(legendAreaMetricSelector)
	colorMetric$ = this.store.select(legendColorMetricSelector)
	edgeMetric$ = this.store.select(legendEdgeMetricSelector)
	attributeDescriptors$ = this.store.select(attributeDescriptorsSelector)

	constructor(
		@Inject(IsAttributeSideBarVisibleService) public isAttributeSideBarVisibleService: IsAttributeSideBarVisibleService,
		@Inject(Store) private store: Store
	) {}

	toggleIsLegendVisible() {
		this.isLegendVisible = !this.isLegendVisible
	}
}
