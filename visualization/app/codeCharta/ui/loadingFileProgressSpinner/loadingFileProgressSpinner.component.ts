import { Component, ViewEncapsulation } from "@angular/core"
import { Observable } from "rxjs"
import { Store } from "../../state/angular-redux/store"
import { isLoadingFileSelector } from "../../state/store/appSettings/isLoadingFile/isLoadingFile.selector"

@Component({
	selector: "cc-loading-file-progress-spinner",
	templateUrl: "./loadingFileProgressSpinner.component.html",
	styleUrls: ["./loadingFileProgressSpinner.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class LoadingFileProgressSpinnerComponent {
	isLoadingFile$: Observable<boolean>

	constructor(store: Store) {
		this.isLoadingFile$ = store.select(isLoadingFileSelector)
	}
}
