import { Inject, Injectable } from "@angular/core"
import { filter, map, tap } from "rxjs"
import { createEffect } from "../../angular-redux/effects/createEffect"
import { Actions, ActionsToken } from "../../angular-redux/effects/effects.module"
import { Store } from "../../angular-redux/store"
import { splitStateActions } from "../../store/state.splitter"

@Injectable()
export class SplitStateActionsEffect {
	constructor(@Inject(ActionsToken) private actions$: Actions, @Inject(Store) private store: Store) {}

	splitStateActions$ = createEffect(
		() =>
			this.actions$.pipe(
				map(() => splitStateActions()),
				filter(Boolean),
				tap(splittedActions => {
					for (const splittedAction of splittedActions) {
						this.store.dispatch(splittedAction)
					}
				})
			),
		{ dispatch: false }
	)
}
