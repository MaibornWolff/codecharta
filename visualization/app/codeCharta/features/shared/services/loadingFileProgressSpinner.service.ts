import { Injectable } from "@angular/core"
import { combineLatest, map, Observable } from "rxjs"
import { ViewId } from "../../../routing/routePaths"
import { ViewReadinessStore } from "../../../routing/viewReadiness.store"
import { FileStoreReadWindow } from "../../../stores/fileStore/fileStore.facade"
import { isApplyingScenario$ } from "../../../util/busy/isApplyingScenario"
import { isPendingHeavyDispatch$ } from "../../../util/dispatchAfterPaint"

@Injectable({
    providedIn: "root"
})
export class LoadingFileProgressSpinnerService {
    constructor(
        private readonly viewReadinessStore: ViewReadinessStore,
        private readonly fileStoreReadWindow: FileStoreReadWindow
    ) {}

    isLoading$(view: ViewId): Observable<boolean> {
        return combineLatest([
            this.viewReadinessStore.isStale$(view),
            this.fileStoreReadWindow.isLoadingFile$,
            isPendingHeavyDispatch$,
            isApplyingScenario$
        ]).pipe(map(sources => sources.some(Boolean)))
    }
}
