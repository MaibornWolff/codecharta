import { Component, Inject, OnInit } from "@angular/core"
import { Observable } from "rxjs"
import { Store } from "../../../state/angular-redux/store"
import { hoveredBuildingPathSelector } from "../../../state/store/lookUp/hoveredBuildingPath/hoveredBuildingPath.selector"

@Component({
	selector: "cc-map-tree-view-level-item-content",
	template: require("./mapTreeViewLevelItemContent.component.html")
})
export class MapTreeViewLevelItemContent implements OnInit {
	hoveredBuildingId$: Observable<string | null>

	constructor(@Inject(Store) private store: Store) {}

	ngOnInit() {
		this.hoveredBuildingId$ = this.store.select(hoveredBuildingPathSelector)
		// this.hoveredBuildingId$.subscribe(v => console.log(v))
	}
}
