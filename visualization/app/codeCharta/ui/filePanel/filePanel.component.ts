import { Component, ViewEncapsulation } from "@angular/core"
import { Store } from "../../state/angular-redux/store"
import { isDeltaStateSelector } from "../../state/selectors/isDeltaState.selector"

@Component({
	selector: "cc-file-panel",
	templateUrl: "./filePanel.component.html",
	styleUrls: ["./filePanel.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class FilePanelComponent {
	isDeltaState$ = this.store.select(isDeltaStateSelector)

	constructor(private store: Store) {}
}
