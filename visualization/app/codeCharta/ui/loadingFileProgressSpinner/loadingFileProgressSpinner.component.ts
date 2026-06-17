import { Component } from "@angular/core"
import { Store } from "@ngrx/store"
import { combineLatest, map, Observable } from "rxjs"
import { CcState } from "../../codeCharta.model"
import { isLoadingFileSelector } from "../../state/store/appSettings/isLoadingFile/isLoadingFile.selector"
import { isPendingHeavyDispatch$ } from "../../util/dispatchAfterPaint"
import { AsyncPipe } from "@angular/common"

@Component({
    selector: "cc-loading-file-progress-spinner",
    templateUrl: "./loadingFileProgressSpinner.component.html",
    imports: [AsyncPipe]
})
export class LoadingFileProgressSpinnerComponent {
    isLoading$: Observable<boolean>

    constructor(store: Store<CcState>) {
        this.isLoading$ = combineLatest([store.select(isLoadingFileSelector), isPendingHeavyDispatch$]).pipe(
            map(([isLoadingFile, isPendingHeavy]) => isLoadingFile || isPendingHeavy)
        )
    }
}
