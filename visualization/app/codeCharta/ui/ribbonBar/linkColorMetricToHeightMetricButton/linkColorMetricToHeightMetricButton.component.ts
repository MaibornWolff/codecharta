import { Component, Inject, ViewEncapsulation } from "@angular/core"
import { Store } from "../../../state/angular-redux/store"
import { isColorMetricLinkedToHeightMetricSelector } from "../../../state/store/appSettings/isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.selector"
import { toggleIsColorMetricLinkedToHeightMetric } from "../../../state/store/appSettings/isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.actions"

@Component({
	selector: "cc-link-color-metric-to-height-metric-button",
	templateUrl: "./linkColorMetricToHeightMetricButton.component.html",
	styleUrls: ["./linkColorMetricToHeightMetricButton.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class LinkColorMetricToHeightMetricButtonComponent {
	isColorMetricLinkedToHeightMetric$ = this.store.select(isColorMetricLinkedToHeightMetricSelector)

	constructor(@Inject(Store) private store: Store) {}

	toggleIsColorMetricLinkedToHeightMetric() {
		this.store.dispatch(toggleIsColorMetricLinkedToHeightMetric())
	}
}
