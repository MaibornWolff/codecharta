import { SortingDialogOptionAction, setSortingDialogOption } from "./sortingDialogOption.actions"
import { SortingOption } from "../../../../codeCharta.model"

export function splitSortingDialogOptionAction(payload: SortingOption): SortingDialogOptionAction {
	return setSortingDialogOption(payload)
}
