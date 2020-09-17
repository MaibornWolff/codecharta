import { setSortingOption } from "./sortingOption.actions"
import { SortingOption } from "../../../../codeCharta.model"

export function splitSortingOptionAction(payload: SortingOption) {
	return setSortingOption(payload)
}
