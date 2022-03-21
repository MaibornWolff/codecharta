import "./loadingFileProgressSpinner.component.scss"
import { Component, Inject } from "@angular/core"
import { Observable } from "rxjs"
import { Store } from "../../state/angular-redux/store"
import { isLoadingFileSelector } from "../../state/store/appSettings/isLoadingFile/isLoadingFile.selector"

@Component({
	selector: "cc-loading-file-progress-spinner",
	template: require("./loadingFileProgressSpinner.component.html")
})
export class LoadingFileProgressSpinnerComponent {
	isLoadingFile$: Observable<boolean>

	constructor(@Inject(Store) store: Store) {
		this.isLoadingFile$ = store.select(isLoadingFileSelector)
	}
}
