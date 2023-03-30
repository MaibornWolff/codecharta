import { Injectable } from "@angular/core"
import { createEffect, ofType, Actions } from "@ngrx/effects"
import { NodeContextMenuService } from "./nodeContextMenu.service"
import { setRightClickedNodeData } from "../../store/appStatus/rightClickedNodeData/rightClickedNodeData.actions"
import { tap } from "rxjs"

@Injectable()
export class OpenNodeContextMenuEffect {
	constructor(private actions$: Actions, private nodeContextMenu: NodeContextMenuService) {}

	openNodeContextMenu$ = createEffect(
		() =>
			this.actions$.pipe(
				ofType(setRightClickedNodeData),
				tap(payload => {
					if (payload.value) {
						this.nodeContextMenu.open(payload.value.xPositionOfRightClickEvent, payload.value.yPositionOfRightClickEvent)
					}
				})
			),
		{ dispatch: false }
	)
}
