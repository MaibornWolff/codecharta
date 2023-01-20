import { Injectable, Inject } from "@angular/core"
import { tap } from "rxjs"
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog"
import { clone } from "../../util/clone"
import { CCFileValidationResult } from "../../util/fileValidator"
import { setFiles, setStandardByNames } from "../../state/store/files/files.actions"
import { FileState } from "../../model/files/files"
import { NameDataPair } from "../../codeCharta.model"
import { referenceFileSelector } from "../../state/selectors/referenceFile/referenceFile.selector"
import { ErrorDialogComponent } from "../../ui/dialogs/errorDialog/errorDialog.component"
import { loadFilesValidationToErrorDialog } from "../../util/loadFilesValidationToErrorDialog"
import { Store } from "../../state/angular-redux/store"
import { State } from "../../state/angular-redux/state"
import { enrichFileStatesAndRecentFilesWithValidationResults } from "./fileParser"
import { fileRoot } from "./fileRoot"

@Injectable({ providedIn: "root" })
export class LoadFileService {
	static readonly CC_FILE_EXTENSION = ".cc.json"

	referenceFileSubscription = this.store
		.select(referenceFileSelector)
		.pipe(
			tap(newReferenceFile => {
				if (newReferenceFile) {
					fileRoot.updateRoot(newReferenceFile.map.name)
				}
			})
		)
		.subscribe()

	constructor(@Inject(Store) private store: Store, @Inject(State) private state: State, @Inject(MatDialog) private dialog: MatDialog) {}

	loadFiles(nameDataPairs: NameDataPair[]) {
		const fileStates: FileState[] = clone(this.state.getValue().files)
		const recentFiles: string[] = []
		const fileValidationResults: CCFileValidationResult[] = []

		enrichFileStatesAndRecentFilesWithValidationResults(fileStates, recentFiles, nameDataPairs, fileValidationResults)

		if (fileValidationResults.length > 0) {
			this.dialog.open(ErrorDialogComponent, {
				data: loadFilesValidationToErrorDialog(fileValidationResults)
			})
		}

		if (recentFiles.length === 0) {
			throw new Error("No files could be uploaded")
		}

		this.store.dispatch(setFiles(fileStates))

		const recentFile = recentFiles[0]
		const rootName = this.state.getValue().files.find(f => f.file.fileMeta.fileName === recentFile).file.map.name
		this.store.dispatch(setStandardByNames(recentFiles))

		fileRoot.updateRoot(rootName)
	}
}
