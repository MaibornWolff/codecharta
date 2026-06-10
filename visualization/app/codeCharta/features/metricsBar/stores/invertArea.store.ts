import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { invertAreaSelector } from "../../../state/store/appSettings/invertArea/invertArea.selector"
import { setInvertArea } from "../../../state/store/appSettings/invertArea/invertArea.actions"

@Injectable({
    providedIn: "root"
})
export class InvertAreaStore {
    constructor(private readonly store: Store<CcState>) {}

    invertArea$ = this.store.select(invertAreaSelector)

    setInvertArea(value: boolean) {
        this.store.dispatch(setInvertArea({ value }))
    }
}
