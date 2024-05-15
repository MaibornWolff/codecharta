import { Injectable } from "@angular/core"
import { map } from "rxjs"
import { createEffect } from "@ngrx/effects"
import { visibleFileStatesSelector } from "../../selectors/visibleFileStates.selector"
import { unfocusAllNodes } from "../../store/dynamicSettings/focusedNodePath/focusedNodePath.actions"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"

@Injectable()
export class UnfocusNodesEffect {
    constructor(private store: Store<CcState>) {}

    unfocusNodes$ = createEffect(() => this.store.select(visibleFileStatesSelector).pipe(map(() => unfocusAllNodes())))
}
