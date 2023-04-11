import { Component, ViewEncapsulation } from "@angular/core"
import { Store } from "@ngrx/store"
import { Observable } from "rxjs"
import { CcState } from "../../codeCharta.model"
import { isLoadingFileSelector } from "../../state/store/appSettings/isLoadingFile/isLoadingFile.selector"

@Component({
	selector: "cc-loading-file-progress-spinner",
	templateUrl: "./loadingFileProgressSpinner.component.html",
	styleUrls: ["./loadingFileProgressSpinner.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class LoadingFileProgressSpinnerComponent {
	isLoadingFile$: Observable<boolean>

	constructor(store: Store<CcState>) {
		this.isLoadingFile$ = store.select(isLoadingFileSelector)
	}
}
