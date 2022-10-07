import "./linkColorMetricToHeightMetricButton.component.scss"
import { Component, Inject } from "@angular/core"
import { Store } from "../../../state/angular-redux/store"
import { isColorMetricLinkedToHeightMetricSelector } from "../../../state/store/appSettings/isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.selector"
import { toggleIsColorMetricLinkedToHeightMetric } from "../../../state/store/appSettings/isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.actions"

@Component({
	selector: "cc-link-color-metric-to-height-metric-button",
	template: require("./linkColorMetricToHeightMetricButton.component.html")
})
export class LinkColorMetricToHeightMetricButtonComponent {
	isColorMetricLinkedToHeightMetric$ = this.store.select(isColorMetricLinkedToHeightMetricSelector)

	constructor(@Inject(Store) private store: Store) {}

	toggleLinkBetweenColorMetricAndHeightMetric() {
		this.store.dispatch(toggleIsColorMetricLinkedToHeightMetric())
	}
}
