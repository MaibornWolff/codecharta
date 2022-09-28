import "./linkHeightAndColorMetricButton.component.scss"
import { Component, Inject } from "@angular/core"
import { Store } from "../../../state/angular-redux/store"
import { isHeightAndColorMetricLinkedSelector } from "../../../state/store/appSettings/isHeightAndColorMetricLinked/isHeightAndColorMetricLinked.selector"
import { toggleHeightAndColorMetricLink } from "../../../state/store/appSettings/isHeightAndColorMetricLinked/isHeightAndColorMetricLinked.actions"

@Component({
	selector: "cc-link-height-and-color-metric-button",
	template: require("./linkHeightAndColorMetricButton.component.html")
})
export class LinkHeightAndColorMetricButtonComponent {
	isHeightAndColorMetricLinked$ = this.store.select(isHeightAndColorMetricLinkedSelector)

	constructor(@Inject(Store) private store: Store) {}

	toggleHeightAndColorMetricLink() {
		this.store.dispatch(toggleHeightAndColorMetricLink())
	}
}
