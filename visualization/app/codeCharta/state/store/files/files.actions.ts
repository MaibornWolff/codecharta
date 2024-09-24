import { createAction, props } from "@ngrx/store"
import { CCFile } from "../../../codeCharta.model"
import { FileState } from "../../../model/files/files"

export const setFiles = createAction("SET_FILES", props<{ value: FileState[] }>())
export const addFile = createAction("ADD_FILE", props<{ file: CCFile }>())
export const removeFile = createAction("REMOVE_FILE", props<{ fileName: string }>())
export const setStandard = createAction("SET_STANDARD", props<{ files: CCFile[] }>())
export const setStandardByNames = createAction("SET_STANDARD_BY_NAMES", props<{ fileNames: string[] }>())
export const setAll = createAction("SET_ALL")
export const invertStandard = createAction("INVERT_STANDARD")
export const switchReferenceAndComparison = createAction("SWITCH_REFERENCE_AND_COMPARISON")
export const setDeltaComparison = createAction("SET_DELTA_COMPARISON", props<{ file: CCFile }>())
export const setDeltaReference = createAction("SET_DELTA_REFERENCE", props<{ file: CCFile }>())
export const setDelta = createAction("SET_DELTA", props<{ referenceFile: CCFile; comparisonFile: CCFile }>())
export const fileActions = [
    setFiles,
    addFile,
    removeFile,
    setStandard,
    setStandardByNames,
    setAll,
    invertStandard,
    switchReferenceAndComparison,
    setDeltaComparison,
    setDeltaReference,
    setDelta
]
