import { CCFile } from "../../codeCharta.model"

export interface FileState {
	file: CCFile
	selectedAs: FileSelectionState
}

export enum FileSelectionState {
	Single = "Single",
	Reference = "Reference",
	Comparison = "Comparison",
	Partial = "Partial",
	None = "None"
}
