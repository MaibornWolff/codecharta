import { createSelector } from "@ngrx/store"
import { FileSelectionState, FileState, SecurityData } from "../../../model/codeCharta.model"
import { isDeltaState, isPartialState } from "../../../model/files/files.helper"
import { visibleFileStatesSelector } from "../../../stores/fileStore/fileStore.facade"
import { mergedSecurity, securityUnderFileName } from "../securityData"

/** The packages of the maps shown: in compare mode those of the newer map, side by side each under its map's folder. */
export function _visibleSecurity(fileStates: FileState[]): SecurityData | undefined {
    if (isDeltaState(fileStates)) {
        const shown = fileStates.find(({ selectedAs }) => selectedAs === FileSelectionState.Comparison) ?? fileStates[0]
        return shown?.file.settings.fileSettings.security
    }
    const withSecurity = fileStates.filter(({ file }) => file.settings.fileSettings.security)
    if (withSecurity.length <= 1 || !isPartialState(fileStates)) {
        return withSecurity[0]?.file.settings.fileSettings.security
    }
    return mergedSecurity(
        withSecurity.map(({ file }) => securityUnderFileName(file.settings.fileSettings.security, file.fileMeta.fileName))
    )
}

export const securitySelector = createSelector(visibleFileStatesSelector, _visibleSecurity)

export const hasSecuritySelector = createSelector(securitySelector, security => Object.keys(security?.packages ?? {}).length > 0)
