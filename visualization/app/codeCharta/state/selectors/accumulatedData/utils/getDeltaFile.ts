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

    return visibleFileStates[0].file
}
