import { Injectable } from "@angular/core"
import { combineLatest, map, Observable } from "rxjs"
import { IsLoadingFileStore } from "../stores/isLoadingFile.store"
import { isPendingHeavyDispatch$ } from "../../../util/dispatchAfterPaint"

@Injectable({
    providedIn: "root"
})
export class LoadingFileProgressSpinnerService {
    constructor(private readonly isLoadingFileStore: IsLoadingFileStore) {}

    isLoading$(): Observable<boolean> {
        return combineLatest([this.isLoadingFileStore.isLoadingFile$, isPendingHeavyDispatch$]).pipe(
            map(([isLoadingFile, isPendingHeavy]) => isLoadingFile || isPendingHeavy)
        )
    }
}
