import { Component, ViewEncapsulation } from "@angular/core"
import { Store } from "@ngrx/store"
import { State } from "../../codeCharta.model"
import { isDeltaStateSelector } from "../../state/selectors/isDeltaState.selector"

@Component({
	selector: "cc-file-panel",
	templateUrl: "./filePanel.component.html",
	styleUrls: ["./filePanel.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class FilePanelComponent {
	isDeltaState$ = this.store.select(isDeltaStateSelector)

	constructor(private store: Store<State>) {}
}
