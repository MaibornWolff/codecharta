import { Injectable, Inject } from "@angular/core"
import { CCFileValidationResult, checkErrors, checkWarnings } from "../../util/fileValidator"
import { NodeDecorator } from "../../util/nodeDecorator"
import { setFiles, setStandardByNames } from "../../state/store/files/files.actions"
import { FileSelectionState, FileState } from "../../model/files/files"
import { getCCFile } from "../../util/fileHelper"
import { NameDataPair } from "../../codeCharta.model"
import { referenceFileSelector } from "../../state/selectors/referenceFile/referenceFile.selector"
import { MatDialog } from "@angular/material/dialog"
import { ErrorDialogComponent } from "../../ui/dialogs/errorDialog/errorDialog.component"
import { loadFilesValidationToErrorDialog } from "../../util/loadFilesValidationToErrorDialog"
import { Store } from "../../state/angular-redux/store"
import { State } from "../../state/angular-redux/state"
import { tap } from "rxjs"
import { clone } from "../../util/clone"

@Injectable({ providedIn: "root" })
export class LoadFileService {
	static ROOT_NAME = "root"
	static ROOT_PATH = `/${LoadFileService.ROOT_NAME}`
	static readonly CC_FILE_EXTENSION = ".cc.json"

	referenceFileSubscription = this.store
		.select(referenceFileSelector)
		.pipe(
			tap(newReferenceFile => {
				if (newReferenceFile) {
					LoadFileService.updateRootData(newReferenceFile.map.name)
				}
			})
		)
		.subscribe()

	constructor(@Inject(Store) private store: Store, @Inject(State) private state: State, @Inject(MatDialog) private dialog: MatDialog) {}

	loadFiles(nameDataPairs: NameDataPair[]) {
		const fileStates: FileState[] = clone(this.state.getValue().files)
		const recentFiles: string[] = []
		const fileValidationResults: CCFileValidationResult[] = []

		this.getValidationResults(fileStates, recentFiles, nameDataPairs, fileValidationResults)

		if (fileValidationResults.length > 0) {
			this.dialog.open(ErrorDialogComponent, {
				data: loadFilesValidationToErrorDialog(fileValidationResults)
			})
		}

		if (recentFiles.length > 0) {
			this.store.dispatch(setFiles(fileStates))

			const recentFile = recentFiles[0]
			const rootName = this.state.getValue().files.find(f => f.file.fileMeta.fileName === recentFile).file.map.name
			this.store.dispatch(setStandardByNames(recentFiles))

			LoadFileService.updateRootData(rootName)
		} else {
			throw new Error("No files could be uploaded")
		}
	}

	private getValidationResults(
		fileStates: FileState[],
		recentFiles: string[],
		nameDataPairs: NameDataPair[],
		fileValidationResults: CCFileValidationResult[]
	) {
		for (const nameDataPair of nameDataPairs) {
			const fileValidationResult: CCFileValidationResult = {
				fileName: nameDataPair?.fileName,
				errors: [],
				warnings: []
			}
			fileValidationResult.errors.push(...checkErrors(nameDataPair?.content))

			if (fileValidationResult.errors.length === 0) {
				fileValidationResult.warnings.push(...checkWarnings(nameDataPair?.content))
				this.addFile(fileStates, recentFiles, nameDataPair)
			}

			if (fileValidationResult.errors.length > 0 || fileValidationResult.warnings.length > 0) {
				fileValidationResults.push(fileValidationResult)
			}
		}
	}

	private addFile(fileStates: FileState[], recentFiles: string[], file: NameDataPair) {
		const ccFile = getCCFile(file)
		NodeDecorator.decorateMapWithPathAttribute(ccFile)
		const currentFileChecksum = ccFile.fileMeta.fileChecksum
		let currentFileName = ccFile.fileMeta.fileName
		const storedFileNames = new Map(
			fileStates.map(fileState => [fileState.file.fileMeta.fileName, fileState.file.fileMeta.fileChecksum])
		)
		const storedFileChecksums = new Map(
			fileStates.map((fileState, index) => [fileState.file.fileMeta.fileChecksum, index] as [string, number])
		)
		const isDuplicate = storedFileChecksums.has(currentFileChecksum)

		if (storedFileNames.has(currentFileName)) {
			currentFileName = this.getFileName(currentFileName, storedFileNames, currentFileChecksum)
			ccFile.fileMeta.fileName = currentFileName
		}
		if (isDuplicate) {
			fileStates[storedFileChecksums.get(currentFileChecksum)].file.fileMeta.fileName = currentFileName
			recentFiles[0] = currentFileName
			recentFiles.push(currentFileName)
			return
		}

		fileStates.push({ file: ccFile, selectedAs: FileSelectionState.None })
		recentFiles.push(currentFileName)
	}

	private getFileName(currentFileName: string, storedFileNames: Map<string, string>, currentFileChecksum: string) {
		if (storedFileNames.get(currentFileName) === currentFileChecksum) {
			return currentFileName
		}

		let nameFound = false
		let fileNameOccurrence = 1
		let newFileName = currentFileName

		while (!nameFound) {
			const endOfNameIndex = currentFileName.indexOf(".")
			newFileName =
				endOfNameIndex >= 0
					? [currentFileName.slice(0, endOfNameIndex), "_", fileNameOccurrence, currentFileName.slice(endOfNameIndex)].join("")
					: `${currentFileName}_${fileNameOccurrence}`
			// resolve if uploaded file has identical checksum and different already occurring name
			if (storedFileNames.get(newFileName) === currentFileChecksum || !storedFileNames.has(newFileName)) {
				nameFound = true
			}
			fileNameOccurrence++
		}
		return newFileName
	}

	static updateRootData(rootName: string) {
		LoadFileService.ROOT_NAME = rootName
		LoadFileService.ROOT_PATH = `/${LoadFileService.ROOT_NAME}`
	}
}
