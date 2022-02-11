import "./attributeSideBar.component.scss"
import { Observable, map } from "rxjs"
import { Component, Inject } from "@angular/core"

import { CodeMapNode } from "../../codeCharta.model"
import { Store } from "../../state/angular-redux/store"
import { isAttributeSideBarVisibleSelector } from "../../state/store/appSettings/isAttributeSideBarVisible/isAttributeSideBarVisible.selector"
import { selectedNodeSelector } from "../../state/selectors/selectedNode.selector"
import { accumulatedDataSelector } from "../../state/selectors/accumulatedData/accumulatedData.selector"

@Component({
	selector: "cc-attribute-side-bar",
	template: require("./attributeSideBar.component.html")
})
export class AttributeSideBarComponent {
	isSideBarVisible$: Observable<boolean>
	selectedNode$: Observable<CodeMapNode>
	fileName$: Observable<string>

	constructor(@Inject(Store) store: Store) {
		this.isSideBarVisible$ = store.select(isAttributeSideBarVisibleSelector)
		this.selectedNode$ = store.select(selectedNodeSelector)
		this.fileName$ = store.select(accumulatedDataSelector).pipe(map(accumulatedData => accumulatedData.unifiedFileMeta?.fileName ?? ""))
	}
}
