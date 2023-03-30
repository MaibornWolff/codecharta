import { Component, Input, OnInit, ViewEncapsulation } from "@angular/core"
import { Store } from "@ngrx/store"
import { Observable } from "rxjs"

import { MapColors, CodeMapNode, State } from "../../../codeCharta.model"
import { selectedNodeSelector } from "../../../state/selectors/selectedNode.selector"
import { mapColorsSelector } from "../../../state/store/appSettings/mapColors/mapColors.selector"

@Component({
	selector: "cc-metric-delta-selected",
	templateUrl: "./metricDeltaSelected.component.html",
	encapsulation: ViewEncapsulation.None
})
export class MetricDeltaSelectedComponent implements OnInit {
	@Input() metricName: string

	selectedNode$: Observable<CodeMapNode>
	mapColors$: Observable<MapColors>

	constructor(private store: Store<State>) {}

	ngOnInit(): void {
		this.selectedNode$ = this.store.select(selectedNodeSelector)
		this.mapColors$ = this.store.select(mapColorsSelector)
	}
}
