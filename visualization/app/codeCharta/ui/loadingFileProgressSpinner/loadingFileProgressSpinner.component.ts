import { Component } from "@angular/core"
import { Store } from "@ngrx/store"
import { Observable } from "rxjs"
import { CcState } from "../../codeCharta.model"
import { isLoadingFileSelector } from "../../state/store/appSettings/isLoadingFile/isLoadingFile.selector"
import { MatProgressSpinner } from "@angular/material/progress-spinner"
import { AsyncPipe } from "@angular/common"

@Component({
    selector: "cc-loading-file-progress-spinner",
    templateUrl: "./loadingFileProgressSpinner.component.html",
    styleUrls: ["./loadingFileProgressSpinner.component.scss"],
    standalone: true,
    imports: [MatProgressSpinner, AsyncPipe]
})
export class LoadingFileProgressSpinnerComponent {
    isLoadingFile$: Observable<boolean>

    constructor(store: Store<CcState>) {
        this.isLoadingFile$ = store.select(isLoadingFileSelector)
    }
}
