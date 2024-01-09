import { Injectable } from "@angular/core"
import { createEffect } from "@ngrx/effects"

import { combineLatest, map, pairwise } from "rxjs"
import { visibleFileStatesSelector } from "../../selectors/visibleFileStates.selector"
import { codeMapNodesSelector } from "../../selectors/accumulatedData/codeMapNodes.selector"
import { setAmountOfTopLabels } from "../../store/appSettings/amountOfTopLabels/amountOfTopLabels.actions"
import { getNumberOfTopLabels } from "./getNumberOfTopLabels"
import { State, Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"

@Injectable()
export class UpdateVisibleTopLabelsEffect {
	constructor(private store: Store<CcState>, private state: State<CcState>) {}

	updateVisibleTopLabels$ = createEffect(() =>
		combineLatest([
			this.store.select(visibleFileStatesSelector).pipe(pairwise()),
			this.store.select(codeMapNodesSelector).pipe(pairwise())
		]).pipe(
			map(([[previousVisibleFileStates, currentVisibleFileStates], [, currentCodeMapNodes]]) => {
				const state = this.state.getValue()
				const isVisibleFileStatesUnchanged = JSON.stringify(previousVisibleFileStates) === JSON.stringify(currentVisibleFileStates)
				const amountOfTopLabels = isVisibleFileStatesUnchanged
					? state.appSettings.amountOfTopLabels
					: getNumberOfTopLabels(currentCodeMapNodes)

				return setAmountOfTopLabels({ value: amountOfTopLabels })
			})
		)
	)
}
