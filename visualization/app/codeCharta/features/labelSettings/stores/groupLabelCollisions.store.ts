import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { groupLabelCollisionsSelector } from "../../../stores/mapState/mapState.read.facade"
import { setGroupLabelCollisions } from "../../../stores/mapState/mapState.write.facade"

@Injectable({
    providedIn: "root"
})
export class GroupLabelCollisionsStore {
    constructor(private readonly store: Store<CcState>) {}

    groupLabelCollisions$ = this.store.select(groupLabelCollisionsSelector)

    setGroupLabelCollisions(value: boolean) {
        this.store.dispatch(setGroupLabelCollisions({ value }))
    }
}
