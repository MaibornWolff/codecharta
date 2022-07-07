import { Inject, Injectable } from "@angular/core"
import { pairwise, tap, filter } from "rxjs"
import { FileState } from "../../model/files/files"
import { isDeltaState } from "../../model/files/files.helper"
import { Store } from "../../state/angular-redux/store"
import { setDelta, setStandard } from "../../state/store/files/files.actions"
import { filesSelector } from "../../state/store/files/files.selector"

@Injectable()
export class FileSelectionModeService {
	lastSetFilesOfPreviousMode: FileState[] = []

	constructor(@Inject(Store) private store: Store) {
		// todo unsubscribe
		this.store.select(filesSelector).pipe(
			pairwise(),
			filter(([oldFiles, newFiles]) => isDeltaState(oldFiles) !== isDeltaState(newFiles)),
			tap(([oldFiles]) => {
				this.lastSetFilesOfPreviousMode = oldFiles
			})
		)
	}

	/** Toggles selection mode between "Standard" and "Delta".
	 * If available it restores the last set selected files of new mode.
	 * When it switches to delta mode and there is no reference
	 * file selected, it sets the first selected file as reference as there
	 * must be a reference file for anything being rendered at all.
	 */
	toggle() {
		// todo filter out removed files from lastSetFilesOfPreviousMode
		// Todo rename isDeltaState -> isDeltaMode
		if (isDeltaState(this.lastSetFilesOfPreviousMode)) {
			const referenceFile =
				this.lastSetFilesOfPreviousMode.find(file => file.selectedAs === "Reference") ??
				this.lastSetFilesOfPreviousMode.find(file => file.selectedAs === "Partial")
			const comparisonFile = this.lastSetFilesOfPreviousMode.find(file => file.selectedAs === "Comparison")
			this.store.dispatch(setDelta(referenceFile.file, comparisonFile?.file))
		} else {
			this.store.dispatch(setStandard(this.lastSetFilesOfPreviousMode.map(f => f.file)))
		}
	}
}
