import { Component, Inject, Input, OnInit } from "@angular/core"
import { Observable } from "rxjs"
import { MapColors } from "../../../codeCharta.model"
import { Store } from "../../../state/angular-redux/store"
import { selectedBuildingSelector } from "../../../state/selectors/selectedBuilding.selector"
import { mapColorsSelector } from "../../../state/store/appSettings/mapColors/mapColors.selector"
import { CodeMapBuilding } from "../../codeMap/rendering/codeMapBuilding"

@Component({
	selector: "cc-metric-delta-selected",
	template: require("./metricDeltaSelected.component.html")
})
export class MetricDeltaSelectedComponent implements OnInit {
	@Input() metricName: string

	selectedBuilding$: Observable<CodeMapBuilding>
	mapColors$: Observable<MapColors>

	constructor(@Inject(Store) private store: Store) {}

	ngOnInit(): void {
		this.selectedBuilding$ = this.store.select(selectedBuildingSelector)
		this.mapColors$ = this.store.select(mapColorsSelector)
	}
}
