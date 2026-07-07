import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { isLoadingFileSelector } from "../../../stores/fileStore/store/isLoadingFile/isLoadingFile.selector"

@Injectable({
    providedIn: "root"
})
export class IsLoadingFileStore {
    constructor(private readonly store: Store<CcState>) {}

    isLoadingFile$ = this.store.select(isLoadingFileSelector)
}
