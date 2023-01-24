import { Inject, Injectable } from "@angular/core"
import { createEffect } from "../../angular-redux/effects/createEffect"
import { Actions, ActionsToken } from "../../angular-redux/effects/effects.module"
import { ofType } from "../../angular-redux/ofType"
import { NodeContextMenuService } from "./nodeContextMenu.service"
import {
	RightClickedNodeDataActions,
	SetRightClickedNodeDataAction
} from "../../store/appStatus/rightClickedNodeData/rightClickedNodeData.actions"
import { tap } from "rxjs"

@Injectable()
export class OpenNodeContextMenuEffect {
	constructor(@Inject(ActionsToken) private actions$: Actions, private nodeContextMenu: NodeContextMenuService) {}

	openNodeContextMenu$ = createEffect(
		() =>
			this.actions$.pipe(
				ofType<SetRightClickedNodeDataAction>(RightClickedNodeDataActions.SET_RIGHT_CLICKED_NODE_DATA),
				tap(rightClickedNodeData => {
					if (rightClickedNodeData.payload) {
						this.nodeContextMenu.open(
							rightClickedNodeData.payload.xPositionOfRightClickEvent,
							rightClickedNodeData.payload.yPositionOfRightClickEvent
						)
					}
				})
			),
		{ dispatch: false }
	)
}
