import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { invertAreaSelector } from "../../../stores/mapState/mapState.read.facade"
import { setInvertArea } from "../../../stores/mapState/mapState.write.facade"

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
