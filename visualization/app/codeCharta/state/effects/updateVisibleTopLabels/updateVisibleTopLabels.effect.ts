import { Inject, Injectable } from "@angular/core"
import { Store } from "../../angular-redux/store"
import { createEffect } from "../../angular-redux/effects/createEffect"
import { map, withLatestFrom } from "rxjs"
import { visibleFileStatesSelector } from "../../selectors/visibleFileStates.selector"
import { numberOfFilesSelector } from "../../store/appSettings/amountOfTopLabels/numberOfFiles.selector"
import { defaultAmountOfTopLabels, setAmountOfTopLabels } from "../../store/appSettings/amountOfTopLabels/amountOfTopLabels.actions"

@Injectable()
export class UpdateVisibleTopLabelsEffect {
	BUILDINGS_PER_LABEL = 100
	MAX_NUMBER_OF_LABELS = 10
	updateVisibleTopLabels$ = createEffect(() =>
		this.store.select(visibleFileStatesSelector).pipe(
			withLatestFrom(this.store.select(numberOfFilesSelector)),
			map(([, numberOfFiles]) => {
				return setAmountOfTopLabels(this.getAmountOfTopLabels(numberOfFiles))
			})
		)
	)

	constructor(@Inject(Store) private store: Store) {}

	getAmountOfTopLabels(numberOfFiles: any) {
		const numberOfLabels = Math.floor(numberOfFiles.length / this.BUILDINGS_PER_LABEL)
		if (numberOfLabels <= defaultAmountOfTopLabels) {
			return defaultAmountOfTopLabels
		}
		return Math.min(numberOfLabels, this.MAX_NUMBER_OF_LABELS)
	}
}
