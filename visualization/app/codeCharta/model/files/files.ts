import { CCFile } from "../../codeCharta.model"

export const CC_FILE_EXTENSION = ".cc.json"

export interface FileState {
    file: CCFile
    selectedAs: FileSelectionState
}

export enum FileSelectionState {
    Reference = "Reference",
    Comparison = "Comparison",
    Partial = "Partial",
    None = "None"
}
