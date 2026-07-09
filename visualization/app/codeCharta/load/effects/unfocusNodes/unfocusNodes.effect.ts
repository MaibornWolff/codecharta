import { Injectable } from "@angular/core"
import { createEffect } from "@ngrx/effects"
import { Store } from "@ngrx/store"
import { map } from "rxjs"
import { CcState } from "../../../model/codeCharta.model"
import { visibleFileStatesSelector } from "../../../stores/fileStore/fileStore.facade"
import { unfocusAllNodes } from "../../../stores/sharedView/sharedView.write.facade"

@Injectable()
export class UnfocusNodesEffect {
    constructor(private readonly store: Store<CcState>) {}

    unfocusNodes$ = createEffect(() => this.store.select(visibleFileStatesSelector).pipe(map(() => unfocusAllNodes())))
}
