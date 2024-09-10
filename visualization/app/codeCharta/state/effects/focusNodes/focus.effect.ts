import { Injectable } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { pairwise, startWith, tap, withLatestFrom } from "rxjs"
import { focusNode, unfocusAllNodes, unfocusNode } from "../../store/dynamicSettings/focusedNodePath/focusedNodePath.actions"
import { ThreeMapControlsService } from "../../../ui/codeMap/threeViewer/threeMapControls.service"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { focusedNodePathSelector } from "../../store/dynamicSettings/focusedNodePath/focusedNodePath.selector"
import { currentFocusedNodePathSelector } from "../../store/dynamicSettings/focusedNodePath/currentFocused.selector"
import { isChildPath } from "../../../util/isChildPath"

@Injectable()
export class FocusEffects {
    constructor(
        private actions$: Actions,
        private store: Store<CcState>,
        private threeMapControlsService: ThreeMapControlsService
    ) {}

    focusNode$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(focusNode),
                withLatestFrom(this.store.select(currentFocusedNodePathSelector).pipe(startWith(null), pairwise())),
                tap(([, [previousFocusedNodePath, newFocusedNodePath]]) => {
                    if (previousFocusedNodePath && !isChildPath(newFocusedNodePath, previousFocusedNodePath)) {
                        this.threeMapControlsService.unfocusNode(() => {
                            this.threeMapControlsService.focusNode(newFocusedNodePath)
                        })
                    } else {
                        this.threeMapControlsService.focusNode(newFocusedNodePath)
                    }
                })
            ),
        { dispatch: false }
    )
    unfocus$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(unfocusNode),
                withLatestFrom(this.store.select(focusedNodePathSelector)),
                tap(([, focusedNodePath]) => {
                    if (focusedNodePath.length === 0) {
                        this.threeMapControlsService.unfocusNode()
                        return
                    }
                    this.threeMapControlsService.unfocusNode()
                    this.threeMapControlsService.focusNode(focusedNodePath[0])
                })
            ),
        { dispatch: false }
    )

    unfocusAll$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(unfocusAllNodes),
                tap(() => {
                    this.threeMapControlsService.unfocusNode()
                })
            ),
        { dispatch: false }
    )
}
