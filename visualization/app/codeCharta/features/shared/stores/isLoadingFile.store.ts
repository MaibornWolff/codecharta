import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { isLoadingFileSelector } from "../../../state/store/appSettings/isLoadingFile/isLoadingFile.selector"

@Injectable({
    providedIn: "root"
})
export class IsLoadingFileStore {
    constructor(private readonly store: Store<CcState>) {}

    isLoadingFile$ = this.store.select(isLoadingFileSelector)
}
