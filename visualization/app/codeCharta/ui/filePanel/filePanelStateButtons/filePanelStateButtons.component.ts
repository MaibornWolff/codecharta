import { Component, Inject, ViewEncapsulation } from "@angular/core"
import { Store } from "../../../state/angular-redux/store"
import { isDeltaStateSelector } from "../../../state/selectors/isDeltaState.selector"
import { FileSelectionModeService } from "../fileSelectionMode.service"

@Component({
	selector: "cc-file-panel-state-buttons",
	templateUrl: "./filePanelStateButtons.component.html",
	encapsulation: ViewEncapsulation.None
})
export class FilePanelStateButtonsComponent {
	isDeltaState$ = this.store.select(isDeltaStateSelector)

	constructor(
		@Inject(Store) private store,
		@Inject(FileSelectionModeService) public fileSelectionModeService: FileSelectionModeService
	) {}
}
