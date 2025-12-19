import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { localFolderPathSelector } from "../selectors/editorSettings.selectors"
import { setLocalFolderPath } from "../../../state/store/appSettings/localFolderPath/localFolderPath.actions"

@Injectable({
    providedIn: "root"
})
export class LocalFolderPathStore {
    constructor(private readonly store: Store<CcState>) {}

    localFolderPath$ = this.store.select(localFolderPathSelector)

    setLocalFolderPath(value: string) {
        this.store.dispatch(setLocalFolderPath({ value }))
    }
}
