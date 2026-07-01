import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { invertAreaSelector, setInvertArea } from "../../../appearance/appearance.facade"

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
