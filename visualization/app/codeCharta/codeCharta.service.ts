import { CCFileValidationResult, checkErrors, checkWarnings } from "./util/fileValidator"
import { NodeDecorator } from "./util/nodeDecorator"
import { StoreService } from "./state/store.service"
import { setFiles, setStandardByNames } from "./state/store/files/files.actions"
import { DialogService } from "./ui/dialog/dialog.service"
import { setIsLoadingFile } from "./state/store/appSettings/isLoadingFile/isLoadingFile.actions"
import { FileSelectionState, FileState } from "./model/files/files"
import { getCCFile } from "./util/fileHelper"
import { NameDataPair } from "./codeCharta.model"
import { onStoreChanged } from "./state/angular-redux/onStoreChanged/onStoreChanged"
import { referenceFileSelector } from "./state/selectors/referenceFile/referenceFile.selector"

export class CodeChartaService {
	static ROOT_NAME = "root"
	static ROOT_PATH = `/${CodeChartaService.ROOT_NAME}`
	static ROOT_NAME_COMP = "root"
	static ROOT_PATH_COMP = `/${CodeChartaService.ROOT_NAME}`
	static readonly CC_FILE_EXTENSION = ".cc.json"
	private fileStates: FileState[] = []
	private recentFiles: string[] = []
	unsubscribeReferenceFileSubscription = onStoreChanged(referenceFileSelector, (_, newReferenceFile) => {
		if (newReferenceFile) {
			CodeChartaService.updateRootData(newReferenceFile.map.name)
		}
	})

	constructor(private storeService: StoreService, private dialogService: DialogService) {
		"ngInject"
	}

	async loadFiles(nameDataPairs: NameDataPair[]) {
		this.fileStates = this.storeService.getState().files
		const fileValidationResults: CCFileValidationResult[] = []

		this.getValidationResults(nameDataPairs, fileValidationResults)

		this.storeService.dispatch(setIsLoadingFile(false))

		if (fileValidationResults.length > 0) {
			await this.dialogService.showValidationDialog(fileValidationResults)
		}

		if (this.recentFiles.length > 0) {
			this.storeService.dispatch(setFiles(this.fileStates))

			const recentFile = this.recentFiles[0]
			const rootName = this.storeService.getState().files.find(f => f.file.fileMeta.fileName === recentFile).file.map.name
			this.storeService.dispatch(setStandardByNames(this.recentFiles))

			CodeChartaService.updateRootData(rootName)

			this.fileStates = []
			this.recentFiles = []
		}
	}

	private getValidationResults(nameDataPairs: NameDataPair[], fileValidationResults: CCFileValidationResult[]) {
		for (const nameDataPair of nameDataPairs) {
			const fileValidationResult: CCFileValidationResult = {
				fileName: nameDataPair?.fileName,
				errors: [],
				warnings: []
			}
			fileValidationResult.errors.push(...checkErrors(nameDataPair?.content))

			if (fileValidationResult.errors.length === 0) {
				fileValidationResult.warnings.push(...checkWarnings(nameDataPair?.content))
				this.addFile(nameDataPair)
			}

			if (fileValidationResult.errors.length > 0 || fileValidationResult.warnings.length > 0) {
				fileValidationResults.push(fileValidationResult)
			}
		}
	}

	private addFile(file: NameDataPair) {
		const ccFile = getCCFile(file)
		NodeDecorator.decorateMapWithPathAttribute(ccFile)
		const currentFileChecksum = ccFile.fileMeta.fileChecksum
		let currentFileName = ccFile.fileMeta.fileName
		const storedFileNames = new Map(
			this.fileStates.map(fileState => [fileState.file.fileMeta.fileName, fileState.file.fileMeta.fileChecksum])
		)
		const storedFileChecksums = new Map(
			this.fileStates.map((fileState, index) => [fileState.file.fileMeta.fileChecksum, index] as [string, number])
		)
		const isDuplicate = storedFileChecksums.has(currentFileChecksum)

		if (storedFileNames.has(currentFileName)) {
			currentFileName = this.getFileName(currentFileName, storedFileNames, currentFileChecksum)
			ccFile.fileMeta.fileName = currentFileName
		}
		if (isDuplicate) {
			this.fileStates[storedFileChecksums.get(currentFileChecksum)].file.fileMeta.fileName = currentFileName
			this.recentFiles[0] = currentFileName
			this.recentFiles.push(currentFileName)
			return
		}

		this.fileStates.push({ file: ccFile, selectedAs: FileSelectionState.None })
		this.recentFiles.push(currentFileName)
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
		CodeChartaService.ROOT_NAME = rootName
		CodeChartaService.ROOT_PATH = `/${CodeChartaService.ROOT_NAME}`
	}

	static updateRootDataComparison(rootName: string) {
		CodeChartaService.ROOT_NAME_COMP = rootName
		CodeChartaService.ROOT_PATH_COMP = `/${CodeChartaService.ROOT_NAME_COMP}`
	}
}
