import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { groupLabelCollisionsSelector } from "../selectors/labelSettings.selectors"
import { setGroupLabelCollisions } from "../../../state/store/appSettings/groupLabelCollisions/groupLabelCollisions.actions"

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
