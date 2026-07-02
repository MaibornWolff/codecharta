import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { setIsLoadingFile } from "../../../state/store/appSettings/isLoadingFile/isLoadingFile.actions"
import { setIsLoadingMap } from "../../../mapState/store/isLoadingMap/isLoadingMap.actions"

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
