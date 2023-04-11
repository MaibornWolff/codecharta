import { Component, Input, OnInit, ViewEncapsulation } from "@angular/core"
import { Store } from "@ngrx/store"
import { Observable } from "rxjs"
import { AttributeTypes, PrimaryMetrics, CcState } from "../../../codeCharta.model"
import { createAttributeTypeSelector } from "./createAttributeTypeSelector.selector"
import { isHoveredNodeALeafSelector } from "./isHoveredNodeALeaf.selector"

@Component({
	selector: "cc-metric-chooser-type-hovered",
	templateUrl: "./metricChooserTypeHovered.component.html",
	encapsulation: ViewEncapsulation.None
})
export class MetricChooserTypeHoveredComponent implements OnInit {
	@Input() metricFor: keyof PrimaryMetrics
	@Input() attributeType: keyof AttributeTypes

	isHoveredNodeALeaf$: Observable<boolean>
	attributeType$: Observable<string>

	constructor(private store: Store<CcState>) {}

	ngOnInit(): void {
		this.isHoveredNodeALeaf$ = this.store.select(isHoveredNodeALeafSelector)
		this.attributeType$ = this.store.select(createAttributeTypeSelector(this.attributeType, this.metricFor))
	}
}
