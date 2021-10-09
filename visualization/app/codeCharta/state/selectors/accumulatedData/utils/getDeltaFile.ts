import { FileSelectionState, FileState } from "../../../../model/files/files"
import { DeltaGenerator } from "../../../../util/deltaGenerator"

export const getDeltaFile = (visibleFileStates: FileState[]) => {
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
