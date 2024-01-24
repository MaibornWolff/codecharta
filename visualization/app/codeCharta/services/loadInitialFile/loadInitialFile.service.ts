import pako from "pako"
import { Injectable } from "@angular/core"
import { MatDialog } from "@angular/material/dialog"
import { HttpClient } from "@angular/common/http"
import { NameDataPair, CcState } from "../../codeCharta.model"
import { getCCFiles } from "../../model/files/files.helper"
import { setDelta, setFiles, setStandard } from "../../state/store/files/files.actions"
import { ErrorDialogComponent } from "../../ui/dialogs/errorDialog/errorDialog.component"
import { GlobalSettingsHelper } from "../../util/globalSettingsHelper"
import { LoadFileService } from "../loadFile/loadFile.service"
import { UrlExtractor } from "./urlExtractor"
import sample1 from "../../assets/sample1.cc.json"
import sample2 from "../../assets/sample2.cc.json"
import { ExportCCFile } from "../../codeCharta.api.model"
import { Store, State } from "@ngrx/store"
import { FILES_LOCAL_STORAGE_ELEMENT } from "../../../../app/codeCharta/state/effects/updateFileSettings/updateFileSettings.effect"
import { FileState } from "../../../../app/codeCharta/model/files/files"
import { validateFileStates } from "../loadFile/fileParser"
import { buildErrorMessages, buildWarningsMessages } from "../../../../app/codeCharta/util/loadFilesValidationToErrorDialog"

@Injectable({ providedIn: "root" })
export class LoadInitialFileService {
	private urlUtils = new UrlExtractor(this.httpClient)

	constructor(
		private store: Store,
		private state: State<CcState>,
		private dialog: MatDialog,
		private loadFileService: LoadFileService,
		private httpClient: HttpClient
	) {}

	async loadFilesOrSampleFiles() {
		const fileQueryParametersPresent = this.checkFileQueryParamsPresent()
		if (fileQueryParametersPresent) {
			this.loadFilesFromQueryParams()
		} else {
			this.loadFilesFromLocalStorage()
		}
	}

	private checkFileQueryParamsPresent() {
		return Boolean(this.urlUtils.getParameterByName("file"))
	}

	private async loadFilesFromQueryParams() {
		try {
			const data = await this.urlUtils.getFileDataFromQueryParam()
			this.loadFiles(data)
			this.setRenderStateFromUrl()
		} catch (error) {
			const message = "Files could not be loaded from the given file URL parameter. Loaded sample files instead."
			this.showErrorDialog(error as Error, message)
			this.loadSampleFiles()
		}
	}

	private loadFilesFromLocalStorage() {
		try {
			const files = this.readFilesFromLocalStorage()
			if (!files) {
				this.loadSampleFiles()
			} else {
				const fileValidationResults = validateFileStates(files)
				const errorMessages = buildErrorMessages(fileValidationResults)
				const warningMessages = buildWarningsMessages(fileValidationResults)

				if (errorMessages) {
					throw new Error(...errorMessages)
				} else if (warningMessages) {
					throw new Error(warningMessages.join(""))
				}
				this.store.dispatch(setFiles({ value: files }))
				GlobalSettingsHelper.setGlobalSettingsOfLocalStorageIfExists(this.store, this.state.getValue().appSettings)
			}
		} catch (error) {
			this.loadSampleFiles()
			this.showErrorDialog(error as Error, (error as Error).message)
		}
	}

	private readFilesFromLocalStorage(): FileState[] {
		const localStorageFiles = this.getLocalStorageFiles()

		if (localStorageFiles) {
			try {
				const parsedLocalStorageItem = JSON.parse(localStorageFiles)
				const compressedFiles = parsedLocalStorageItem.files
				const decompressedFiles = pako.inflate(compressedFiles, { to: "string" })
				const files = JSON.parse(decompressedFiles) as FileState[]
				return files
			} catch {
				throw new Error("Files could not be loaded from local storage. Loaded sample files instead.")
			}
		}
	}

	private getLocalStorageFiles() {
		return localStorage.getItem(FILES_LOCAL_STORAGE_ELEMENT)
	}

	private loadSampleFiles() {
		this.loadFiles([
			{ fileName: "sample1.cc.json", fileSize: 3 * 1024, content: sample1 as ExportCCFile },
			{ fileName: "sample2.cc.json", fileSize: 2 * 1024, content: sample2 as ExportCCFile }
		])
	}

	private loadFiles(values: NameDataPair[]) {
		GlobalSettingsHelper.setGlobalSettingsOfLocalStorageIfExists(this.store, this.state.getValue().appSettings)
		this.loadFileService.loadFiles(values)
	}

	private showErrorDialog(error: Error & { statusText?: string; status?: number }, message: string) {
		let title = "Error"
		if (error.message) {
			title += ` (${error.message})`
		} else if (error.statusText && error.status) {
			title += ` (${error.status}: ${error.statusText})`
		}
		this.dialog.open(ErrorDialogComponent, {
			data: { title, message }
		})
	}

	// TODO: Please make sure that this function works fine on Github pages with
	//  the updated file selection (no more single mode!)
	private setRenderStateFromUrl() {
		const renderState = this.urlUtils.getParameterByName("mode")
		const files = getCCFiles(this.state.getValue().files)

		if (renderState === "Delta" && files.length >= 2) {
			this.store.dispatch(setDelta({ referenceFile: files[0], comparisonFile: files[1] }))
		} else {
			this.store.dispatch(setStandard({ files }))
		}
	}
}
