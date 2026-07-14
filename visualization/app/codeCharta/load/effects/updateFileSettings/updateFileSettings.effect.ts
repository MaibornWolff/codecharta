import { Injectable } from "@angular/core"
import { createEffect } from "@ngrx/effects"
import { Store } from "@ngrx/store"
import { map } from "rxjs"
import { CcState } from "../../../model/codeCharta.model"
import { getVisibleFiles, isPartialState } from "../../../model/files/files.helper"
import { FileStoreReadWindow, visibleFileStatesSelector } from "../../../stores/fileStore/fileStore.facade"
import { setState } from "../../../stores/rootStore/state.actions"
import { getMergedAttributeDescriptors } from "./utils/attributeDescriptors.merger"
import { getMergedAttributeTypes } from "./utils/attributeTypes.merger"
import { getMergedBlacklist } from "./utils/blacklist.merger"
import { getMergedMarkedPackages } from "./utils/markedPackages.merger"

@Injectable()
export class UpdateFileSettingsEffect {
    constructor(
        private readonly store: Store<CcState>,
        private readonly fileStoreReadWindow: FileStoreReadWindow
    ) {}

    updateFileSettings$ = createEffect(() =>
        this.store.select(visibleFileStatesSelector).pipe(
            map(() => {
                const files = this.fileStoreReadWindow.getFiles()
                const visibleFiles = getVisibleFiles(files)
                const withUpdatedPath = isPartialState(files)
                const allAttributeTypes = this.fileStoreReadWindow
                    .getVisibleFileStates()
                    .map(({ file }) => file.settings.fileSettings.attributeTypes)
                const allAttributeDescriptors = this.fileStoreReadWindow
                    .getVisibleFileStates()
                    .map(({ file }) => file.settings.fileSettings.attributeDescriptors)
                const mergedAttributeTypes = getMergedAttributeTypes(allAttributeTypes)

                return setState({
                    value: {
                        sharedView: {
                            blacklist: getMergedBlacklist(visibleFiles, withUpdatedPath),
                            markedPackages: getMergedMarkedPackages(visibleFiles, withUpdatedPath)
                        },
                        metricsLensSource: {
                            attributeTypes: mergedAttributeTypes.nodes,
                            attributeDescriptors: getMergedAttributeDescriptors(allAttributeDescriptors)
                        },
                        dependencyLensSource: {
                            attributeTypes: mergedAttributeTypes.edges
                        }
                    }
                })
            })
        )
    )
}
