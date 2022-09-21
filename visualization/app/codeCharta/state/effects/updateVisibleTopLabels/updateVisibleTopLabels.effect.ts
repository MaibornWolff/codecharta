import { Inject, Injectable } from "@angular/core"
import { Store } from "../../angular-redux/store"
import { createEffect } from "../../angular-redux/effects/createEffect"
import { map, withLatestFrom } from "rxjs"
import { visibleFileStatesSelector } from "../../selectors/visibleFileStates.selector"
import { codeMapNodesSelector } from "../../selectors/accumulatedData/codeMapNodesSelector"
import { setAmountOfTopLabels } from "../../store/appSettings/amountOfTopLabels/amountOfTopLabels.actions"
import { getNumberOfTopLabels } from "./getNumberOfTopLabels"

@Injectable()
export class UpdateVisibleTopLabelsEffect {
	constructor(@Inject(Store) private store: Store) {}

	updateVisibleTopLabels$ = createEffect(() =>
		this.store.select(visibleFileStatesSelector).pipe(
			withLatestFrom(this.store.select(codeMapNodesSelector)),
			map(([, codeMapNodes]) => {
				return setAmountOfTopLabels(getNumberOfTopLabels(codeMapNodes))
			})
		)
	)
}
