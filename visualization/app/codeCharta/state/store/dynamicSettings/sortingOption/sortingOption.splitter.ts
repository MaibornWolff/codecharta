import { SortingOptionAction, setSortingOption } from "./sortingOption.actions"
import { SortingOption } from "../../../../codeCharta.model"

export function splitSortingOptionAction(payload: SortingOption): SortingOptionAction {
	return setSortingOption(payload)
}
