import { clone } from "lodash"
import { FileSelectionState, FileState } from "../../model/files/files"
import { getVisibleFileStates, isDeltaState, isPartialState, isSingleState } from "../../model/files/files.helper"
import { AggregationGenerator } from "../../util/aggregationGenerator"
import { DeltaGenerator } from "../../util/deltaGenerator"
import { createSelector } from "../angular-redux/createSelector"
import { fileSelector } from "./file.selector"

const getDeltaFile = (visibleFileStates: FileState[]) => {
	if (visibleFileStates.length === 2) {
		let [reference, comparison] = visibleFileStates
		if (reference.selectedAs !== FileSelectionState.Reference) {
			const temporary = comparison
			comparison = reference
			reference = temporary
		}
		return DeltaGenerator.getDeltaFile(reference.file, comparison.file)
	}
	// Compare with itself. This is somewhat questionable.
	const [{ file }] = visibleFileStates
	return DeltaGenerator.getDeltaFile(file, file)
}

export const unifiedMapSelector = createSelector([fileSelector], files => {
	const visibleFileStates = clone(getVisibleFileStates(files))

	if (isSingleState(files)) {
		return visibleFileStates[0].file
	}
	if (isPartialState(files)) {
		return AggregationGenerator.getAggregationFile(visibleFileStates.map(x => x.file))
	}
	if (isDeltaState(files)) {
		const [reference, comparison] = visibleFileStates
		if (comparison && reference.file.map.name !== comparison.file.map.name) {
			return AggregationGenerator.getAggregationFile(visibleFileStates.map(x => x.file))
		}
		return getDeltaFile(visibleFileStates)
	}
})
