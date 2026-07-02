import { Injectable } from "@angular/core"
import { map } from "rxjs"
import { createEffect } from "@ngrx/effects"
import { visibleFileStatesSelector } from "../../../fileStore/store/visibleFileStates.selector"
import { unfocusAllNodes } from "../../../sharedView/sharedView.facade"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"

@Injectable()
export class UnfocusNodesEffect {
    constructor(private readonly store: Store<CcState>) {}

    unfocusNodes$ = createEffect(() => this.store.select(visibleFileStatesSelector).pipe(map(() => unfocusAllNodes())))
}
