import { Injectable } from "@angular/core"
import { createEffect, ofType, Actions } from "@ngrx/effects"
import { NodeContextMenuService } from "./nodeContextMenu.service"
import { setRightClickedNodeData } from "../../store/appStatus/rightClickedNodeData/rightClickedNodeData.actions"
import { tap } from "rxjs"

@Injectable()
export class OpenNodeContextMenuEffect {
    constructor(
        private actions$: Actions,
        private nodeContextMenu: NodeContextMenuService
    ) {}

    openNodeContextMenu$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(setRightClickedNodeData),
                tap(action => {
                    if (action.value) {
                        this.nodeContextMenu.open(action.value.xPositionOfRightClickEvent, action.value.yPositionOfRightClickEvent)
                    }
                })
            ),
        { dispatch: false }
    )
}
