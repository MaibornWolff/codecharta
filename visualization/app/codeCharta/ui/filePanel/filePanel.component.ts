import "./filePanel.component.scss"
import { Component, Inject } from "@angular/core"
import { Store } from "../../state/angular-redux/store"
import { isDeltaStateSelector } from "../../state/selectors/isDeltaState.selector"

@Component({
	selector: "cc-file-panel",
	template: require("./filePanel.component.html")
})
export class FilePanelComponent {
	isDeltaState$ = this.store.select(isDeltaStateSelector)

	constructor(@Inject(Store) private store: Store) {}
}
