import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { setGroupLabelCollisions } from "../../../stores/mapState/mapState.write.facade"
import { groupLabelCollisionsSelector } from "../selectors/labelSettings.selectors"

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
