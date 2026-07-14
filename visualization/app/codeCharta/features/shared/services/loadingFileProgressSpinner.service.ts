import { Injectable } from "@angular/core"
import { combineLatest, map, Observable } from "rxjs"
import { FileStoreReadWindow } from "../../../stores/fileStore/fileStore.facade"
import { isApplyingScenario$ } from "../../../util/busy/isApplyingScenario"
import { isPendingHeavyDispatch$ } from "../../../util/dispatchAfterPaint"

@Injectable({
    providedIn: "root"
})
export class LoadingFileProgressSpinnerService {
    constructor(private readonly fileStoreReadWindow: FileStoreReadWindow) {}

    isLoading$(): Observable<boolean> {
        return combineLatest([this.fileStoreReadWindow.isLoadingFile$, isPendingHeavyDispatch$, isApplyingScenario$]).pipe(
            map(([isLoadingFile, isPendingHeavy, isApplyingScenario]) => isLoadingFile || isPendingHeavy || isApplyingScenario)
        )
    }
}
