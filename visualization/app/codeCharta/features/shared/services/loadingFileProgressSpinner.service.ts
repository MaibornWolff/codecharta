import { Injectable } from "@angular/core"
import { combineLatest, map, Observable } from "rxjs"
import { isPendingHeavyDispatch$ } from "../../../util/dispatchAfterPaint"
import { IsLoadingFileStore } from "../stores/isLoadingFile.store"

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
