import { Injectable } from "@angular/core"
import { createEffect } from "@ngrx/effects"
import { State, Store } from "@ngrx/store"
import { map } from "rxjs"
import { CcState } from "../../../model/codeCharta.model"
import { getVisibleFiles, isPartialState } from "../../../model/files/files.helper"
import { visibleFileStatesSelector } from "../../../stores/fileStore/fileStore.facade"
import { setState } from "../../../stores/rootStore/state.actions"
import { getMergedAttributeDescriptors } from "./utils/attributeDescriptors.merger"
import { getMergedAttributeTypes } from "./utils/attributeTypes.merger"
import { getMergedBlacklist } from "./utils/blacklist.merger"
import { getMergedMarkedPackages } from "./utils/markedPackages.merger"

@Injectable()
export class UpdateFileSettingsEffect {
    constructor(
        private readonly store: Store<CcState>,
        private readonly state: State<CcState>
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
                // The per-file `attributeTypes` is the full `{ nodes, edges }` map; Slice 14 SPLITS it at
                // the load boundary so the metrics lens owns the node side (metricsLensSource) and the
                // dependency lens owns the edge side (dependencyLensSource). Both are dynamic-key roots
                // (wholesale-replaced), co-emitted in this one setState.
                const mergedAttributeTypes = getMergedAttributeTypes(allAttributeTypes)

                return setState({
                    value: {
                        // Slice 9b+9c: the merged blacklist and markedPackages are co-emitted under the
                        // sharedView home (not fileSettings) in the SAME setState, so a single dynamic-key
                        // replace re-homes each array. (Slice 15e: edges left this effect entirely — it is now
                        // a pure derived selector on the dependency lens, not stored state.)
                        sharedView: {
                            blacklist: getMergedBlacklist(visibleFiles, withUpdatedPath),
                            markedPackages: getMergedMarkedPackages(visibleFiles, withUpdatedPath)
                        },
                        metricsLensSource: {
                            attributeTypes: { nodes: mergedAttributeTypes.nodes, edges: {} },
                            attributeDescriptors: getMergedAttributeDescriptors(allAttributeDescriptors)
                        },
                        dependencyLensSource: {
                            attributeTypes: { nodes: {}, edges: mergedAttributeTypes.edges }
                        }
                    }
                })
            })
        )
    )
}
