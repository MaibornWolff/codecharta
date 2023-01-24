import { Injectable } from "@angular/core"
import { map } from "rxjs"
import { createEffect } from "../../angular-redux/effects/createEffect"
import { Store } from "../../angular-redux/store"
import { visibleFileStatesSelector } from "../../selectors/visibleFileStates.selector"
import { unfocusAllNodes } from "../../store/dynamicSettings/focusedNodePath/focusedNodePath.actions"

@Injectable()
export class UnfocusNodesEffect {
	constructor(private store: Store) {}

	unfocusNodes$ = createEffect(() => this.store.select(visibleFileStatesSelector).pipe(map(() => unfocusAllNodes())))
}
