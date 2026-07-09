import { Injectable } from "@angular/core"
import { createEffect } from "@ngrx/effects"
import { State, Store } from "@ngrx/store"
import { map, pairwise, withLatestFrom } from "rxjs"
import stringify from "safe-stable-stringify"
import { CcState } from "../../../../model/codeCharta.model"
import { codeMapNodesSelector } from "../../../../renderer/renderModel/renderModel.facade"
import { visibleFileStatesSelector } from "../../../../stores/fileStore/fileStore.facade"
import { setAmountOfTopLabels } from "../../../../stores/mapState/mapState.write.facade"
import { getNumberOfTopLabels } from "../../../../util/getNumberOfTopLabels"

@Injectable()
export class UpdateVisibleTopLabelsEffect {
    constructor(
        private readonly store: Store<CcState>,
        private readonly state: State<CcState>
    ) {}

    updateVisibleTopLabels$ = createEffect(() =>
        this.store.select(visibleFileStatesSelector).pipe(
            pairwise(),
            withLatestFrom(this.store.select(codeMapNodesSelector)),
            map(([[previousVisibleFileStates, currentVisibleFileStates], codeMapNodes]) => {
                const isUnchanged = stringify(previousVisibleFileStates) === stringify(currentVisibleFileStates)
                const storedValue = this.state.getValue().mapState.amountOfTopLabels
                const amountOfTopLabels = isUnchanged ? storedValue : Math.min(storedValue, getNumberOfTopLabels(codeMapNodes))

                return setAmountOfTopLabels({ value: amountOfTopLabels })
            })
        )
    )
}
