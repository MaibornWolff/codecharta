import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { marginSelector } from "../../../mapState/store/margin/margin.selector"
import { setMargin } from "../../../mapState/store/margin/margin.actions"

@Injectable({
    providedIn: "root"
})
export class MarginStore {
    constructor(private readonly store: Store<CcState>) {}

    margin$ = this.store.select(marginSelector)

    setMargin(value: number) {
        this.store.dispatch(setMargin({ value }))
    }
}
