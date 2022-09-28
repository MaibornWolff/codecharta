import { Component, Inject } from "@angular/core"
import { Store } from "../../../state/angular-redux/store"
import { toggleHeightAndColorMetricCoupling } from "../../../state/store/appSettings/isHeightAndColorMetricCoupled/isHeightAndColorMetricCoupled.actions"
import { isHeightAndColorMetricCoupledSelector } from "../../../state/store/appSettings/isHeightAndColorMetricCoupled/isHeightAndColorMetricCoupled.selector"

@Component({
	selector: "cc-couple-height-and-color-metric-button",
	template: require("./coupleHeightAndColorMetricButton.component.html")
})
export class CoupleHeightAndColorMetricButtonComponent {
	isHeightAndColorMetricCoupled$ = this.store.select(isHeightAndColorMetricCoupledSelector)

	constructor(@Inject(Store) private store: Store) {}

	toggleHeightAndColorMetricCoupling() {
		this.store.dispatch(toggleHeightAndColorMetricCoupling())
	}
}
