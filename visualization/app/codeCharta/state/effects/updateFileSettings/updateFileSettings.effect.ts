import { Injectable } from "@angular/core"
import { createEffect } from "@ngrx/effects"
import { setState } from "../../store/state.actions"
import { CcState } from "../../../codeCharta.model"
import { map } from "rxjs"
import { getVisibleFiles, isPartialState } from "../../../model/files/files.helper"
import { visibleFileStatesSelector } from "../../selectors/visibleFileStates/visibleFileStates.selector"
import { getMergedEdges } from "./utils/edges.merger"
import { getMergedMarkedPackages } from "./utils/markedPackages.merger"
import { getMergedBlacklist } from "./utils/blacklist.merger"
import { getMergedAttributeTypes } from "./utils/attributeTypes.merger"
import { getMergedAttributeDescriptors } from "./utils/attributeDescriptors.merger"
import { State, Store } from "@ngrx/store"

@Injectable()
export class UpdateFileSettingsEffect {
    constructor(
        private store: Store<CcState>,
        private state: State<CcState>
    ) {}

    updateFileSettings$ = createEffect(() =>
        this.store.select(visibleFileStatesSelector).pipe(
            map(() => {
                const state = this.state.getValue()
                const visibleFiles = getVisibleFiles(state.files)
                const withUpdatedPath = isPartialState(state.files)
                const allAttributeTypes = visibleFileStatesSelector(state).map(({ file }) => file.settings.fileSettings.attributeTypes)
                const allAttributeDescriptors = visibleFileStatesSelector(state).map(
                    ({ file }) => file.settings.fileSettings.attributeDescriptors
                )

                return setState({
                    value: {
                        fileSettings: {
                            edges: getMergedEdges(visibleFiles, withUpdatedPath),
                            markedPackages: getMergedMarkedPackages(visibleFiles, withUpdatedPath),
                            blacklist: getMergedBlacklist(visibleFiles, withUpdatedPath),
                            attributeTypes: getMergedAttributeTypes(allAttributeTypes),
                            attributeDescriptors: getMergedAttributeDescriptors(allAttributeDescriptors)
                        }
                    }
                })
            })
        )
    )
}
