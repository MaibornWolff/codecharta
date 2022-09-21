import { Inject, Injectable } from "@angular/core"
import { Store } from "../../angular-redux/store"
import { createEffect } from "../../angular-redux/effects/createEffect"
import { map, withLatestFrom } from "rxjs"
import { visibleFileStatesSelector } from "../../selectors/visibleFileStates.selector"
import { codeMapNodesSelector } from "../../store/appSettings/amountOfTopLabels/codeMapNodesSelector"
import { setAmountOfTopLabels } from "../../store/appSettings/amountOfTopLabels/amountOfTopLabels.actions"
import { getNumberOfTopLabels } from "./getNumberOfTopLabels"

@Injectable()
export class UpdateVisibleTopLabelsEffect {
	updateVisibleTopLabels$ = createEffect(() =>
		this.store.select(visibleFileStatesSelector).pipe(
			withLatestFrom(this.store.select(codeMapNodesSelector)),
			map(([, numberOfFiles]) => {
				return setAmountOfTopLabels(getNumberOfTopLabels(numberOfFiles))
			})
		)
	)

	constructor(@Inject(Store) private store: Store) {}
}
