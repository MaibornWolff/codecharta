import stringify from "safe-stable-stringify"
import { Injectable } from "@angular/core"
import { State, Store } from "@ngrx/store"
import { createEffect } from "@ngrx/effects"
import { map, pairwise, withLatestFrom } from "rxjs"

import { visibleFileStatesSelector } from "../../selectors/visibleFileStates/visibleFileStates.selector"
import { codeMapNodesSelector } from "../../selectors/accumulatedData/codeMapNodes.selector"
import { setAmountOfTopLabels } from "../../store/appSettings/amountOfTopLabels/amountOfTopLabels.actions"
import { getNumberOfTopLabels } from "./getNumberOfTopLabels"
import { CcState } from "../../../codeCharta.model"

@Injectable()
export class UpdateVisibleTopLabelsEffect {
    constructor(
        private store: Store<CcState>,
        private state: State<CcState>
    ) {}

    updateVisibleTopLabels$ = createEffect(() =>
        this.store.select(visibleFileStatesSelector).pipe(
            pairwise(),
            withLatestFrom(this.store.select(codeMapNodesSelector)),
            map(([[previousVisibleFileStates, currentVisibleFileStates], codeMapNodes]) => {
                const isUnchanged = stringify(previousVisibleFileStates) === stringify(currentVisibleFileStates)
                const amountOfTopLabels = isUnchanged
                    ? this.state.getValue().appSettings.amountOfTopLabels
                    : getNumberOfTopLabels(codeMapNodes)

                return setAmountOfTopLabels({ value: amountOfTopLabels })
            })
        )
    )
}
