import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { setIsLoadingFile } from "../../../stores/fileStore/fileStore.facade"
import { setIsLoadingMap } from "../../../stores/mapState/mapState.write.facade"

@Injectable({ providedIn: "root" })
export class LoadingStateStore {
    constructor(private readonly store: Store<CcState>) {}

    setLoadingFile(value: boolean) {
        this.store.dispatch(setIsLoadingFile({ value }))
    }

    setLoadingMap(value: boolean) {
        this.store.dispatch(setIsLoadingMap({ value }))
    }
}
