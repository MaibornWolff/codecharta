import "./attributeSideBar.component.scss"
import { map } from "rxjs"
import { Component, Inject } from "@angular/core"

import { Store } from "../../state/angular-redux/store"
import { selectedNodeSelector } from "../../state/selectors/selectedNode.selector"
import { accumulatedDataSelector } from "../../state/selectors/accumulatedData/accumulatedData.selector"
import { IsAttributeSideBarVisibleService } from "../../services/isAttributeSideBarVisible.service"

@Component({
	selector: "cc-attribute-side-bar",
	template: require("./attributeSideBar.component.html")
})
export class AttributeSideBarComponent {
	selectedNode$ = this.store.select(selectedNodeSelector)
	fileName$ = this.store.select(accumulatedDataSelector).pipe(map(accumulatedData => accumulatedData.unifiedFileMeta?.fileName ?? ""))

	constructor(
		@Inject(Store) public store: Store,
		@Inject(IsAttributeSideBarVisibleService) public isAttributeSideBarVisibleService: IsAttributeSideBarVisibleService
	) {}
}
