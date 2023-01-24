import { map } from "rxjs"
import { Component, ViewEncapsulation } from "@angular/core"

import { Store } from "../../state/angular-redux/store"
import { selectedNodeSelector } from "../../state/selectors/selectedNode.selector"
import { accumulatedDataSelector } from "../../state/selectors/accumulatedData/accumulatedData.selector"
import { IsAttributeSideBarVisibleService } from "../../services/isAttributeSideBarVisible.service"

@Component({
	selector: "cc-attribute-side-bar",
	templateUrl: "./attributeSideBar.component.html",
	styleUrls: ["./attributeSideBar.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class AttributeSideBarComponent {
	selectedNode$ = this.store.select(selectedNodeSelector)
	fileName$ = this.store.select(accumulatedDataSelector).pipe(map(accumulatedData => accumulatedData.unifiedFileMeta?.fileName ?? ""))

	constructor(public isAttributeSideBarVisibleService: IsAttributeSideBarVisibleService, private store: Store) {}
}
