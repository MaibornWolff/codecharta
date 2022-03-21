import { Component, Inject, Input, OnInit } from "@angular/core"
import { Observable } from "rxjs"
import { AttributeTypes, PrimaryMetrics } from "../../../codeCharta.model"
import { Store } from "../../../state/angular-redux/store"
import { createAttributeTypeSelector } from "./createAttributeTypeSelector.selector"
import { isHoveredNodeALeafSelector } from "./isHoveredNodeALeaf.selector"

@Component({
	selector: "cc-metric-type",
	template: require("./metricType.component.html")
})
export class MetricTypeComponent implements OnInit {
	@Input() metricFor: keyof PrimaryMetrics
	@Input() attributeType: keyof AttributeTypes

	isHoveredNodeALeaf$: Observable<boolean>
	attributeType$: Observable<string>

	constructor(@Inject(Store) private store: Store) {}

	ngOnInit(): void {
		this.isHoveredNodeALeaf$ = this.store.select(isHoveredNodeALeafSelector)
		this.attributeType$ = this.store.select(createAttributeTypeSelector(this.attributeType, this.metricFor))
	}
}
