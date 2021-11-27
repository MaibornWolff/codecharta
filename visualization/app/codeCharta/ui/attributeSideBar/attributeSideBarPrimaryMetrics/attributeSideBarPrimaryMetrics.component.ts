import { Component, Inject } from "@angular/core"
import { Observable } from "rxjs"
import { Node } from "../../../codeCharta.model"
import { Store } from "../../../state/angular-redux/store"
import { selectedNodeSelector } from "../../../state/selectors/selectedNode.selector"
import { PrimaryMetrics, primaryMetricsSelector } from "./primaryMetrics.selector"

@Component({
	selector: "cc-attribute-side-bar-primary-metrics",
	template: require("./attributeSideBarPrimaryMetrics.component.html")
})
export class AttributeSideBarPrimaryMetricsComponent {
	selectedNode$: Observable<Node>
	primaryMetrics$: Observable<PrimaryMetrics>

	constructor(@Inject(Store) store: Store) {
		this.selectedNode$ = store.select(selectedNodeSelector)
		this.primaryMetrics$ = store.select(primaryMetricsSelector)
	}
}
