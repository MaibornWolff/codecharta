import { Component, Inject, Input } from "@angular/core"
import { Observable } from "rxjs"
import { MapColors } from "../../codeCharta.model"
import { Store } from "../../state/angular-redux/store"
import { selectedBuildingIdSelector } from "../../state/store/lookUp/selectedBuildingId/selectedBuildingId.selector"
import { CcState } from "../../state/store/store"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"

@Component({
	selector: "cc-metric-delta-selected",
	template: require("./metricDeltaSelected.component.html")
})
export class MetricDeltaSelectedComponent {
	@Input() attributeKey: string

	selectedBuilding$: Observable<CodeMapBuilding>
	mapColors$: Observable<MapColors>

	constructor(@Inject(Store) private store: Store) {
		this.selectedBuilding$ = this.store.select((state: CcState) => {
			const selectedBuildingId = selectedBuildingIdSelector(state)
			return state.lookUp.idToBuilding.get(selectedBuildingId)
		})
		this.mapColors$ = this.store.select((state: CcState) => state.appSettings.mapColors)
	}
}
