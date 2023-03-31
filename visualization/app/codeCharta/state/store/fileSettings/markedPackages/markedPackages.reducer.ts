import { markPackages, setMarkedPackages, unmarkPackage } from "./markedPackages.actions"
import { removeEntryAtIndexFromArray } from "../../../../util/reduxHelper"
import { addMarkedPackage } from "./util/addMarkedPackage"
import { findIndexOfMarkedPackageOrParent } from "./util/findIndexOfMarkedPackageOrParent"
import { createReducer, on } from "@ngrx/store"
import { MarkedPackage } from "../../../../codeCharta.model"

export const defaultMarkedPackages: MarkedPackage[] = []
export const markedPackages = createReducer(
	defaultMarkedPackages,
	on(setMarkedPackages, (_state, action) => action.value),
	on(markPackages, (state, action) => {
		const markedPackagesMap = new Map(state.map(entry => [entry.path, entry]))

		for (const markedPackage of action.packages) {
			addMarkedPackage(markedPackagesMap, markedPackage)
		}

		return [...markedPackagesMap.values()]
	}),
	on(unmarkPackage, (state, action) => {
		const indexOfPackageToBeUnmarked = findIndexOfMarkedPackageOrParent(state, action.path)
		if (indexOfPackageToBeUnmarked !== -1) {
			return removeEntryAtIndexFromArray(state, indexOfPackageToBeUnmarked)
		}
		return state
	})
)
