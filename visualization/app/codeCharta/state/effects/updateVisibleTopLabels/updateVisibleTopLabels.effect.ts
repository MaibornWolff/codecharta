import { Injectable } from "@angular/core"
import { createEffect } from "@ngrx/effects"

import { map, withLatestFrom } from "rxjs"
import { visibleFileStatesSelector } from "../../selectors/visibleFileStates.selector"
import { codeMapNodesSelector } from "../../selectors/accumulatedData/codeMapNodes.selector"
import { setAmountOfTopLabels } from "../../store/appSettings/amountOfTopLabels/amountOfTopLabels.actions"
import { getNumberOfTopLabels } from "./getNumberOfTopLabels"
import { Store } from "@ngrx/store"
import { State } from "../../../codeCharta.model"

@Injectable()
export class UpdateVisibleTopLabelsEffect {
	constructor(private store: Store<State>) {}

	updateVisibleTopLabels$ = createEffect(() =>
		this.store.select(visibleFileStatesSelector).pipe(
			withLatestFrom(this.store.select(codeMapNodesSelector)),
			map(([, codeMapNodes]) => {
				return setAmountOfTopLabels({ value: getNumberOfTopLabels(codeMapNodes) })
			})
		)
	)
}
