import { Component, Inject } from "@angular/core"
import { Observable } from "rxjs"

import { CodeMapBuilding } from "../../codeMap/rendering/codeMapBuilding"
import { Store } from "../../../state/angular-redux/store"
import { selectedBuildingSelector } from "../../../state/selectors/selectedBuilding.selector"
import { fileCountDescriptionSelector } from "./fileCountDescription.selector"

@Component({
	selector: "cc-node-path",
	template: require("./nodePath.component.html")
})
export class NodePathComponent {
	selectedBuilding$: Observable<CodeMapBuilding>
	fileCountDescription$: Observable<string | undefined>

	constructor(@Inject(Store) store: Store) {
		this.selectedBuilding$ = store.select(selectedBuildingSelector)
		this.fileCountDescription$ = store.select(fileCountDescriptionSelector)
	}
}
