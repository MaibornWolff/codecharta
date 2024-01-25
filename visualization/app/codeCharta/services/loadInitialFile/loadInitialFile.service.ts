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
import { FileState } from "../../../../app/codeCharta/model/files/files"
import { validateFileStates } from "../loadFile/fileParser"
import { buildErrorMessages, buildWarningsMessages } from "../../../../app/codeCharta/util/loadFilesValidationToErrorDialog"
import { loadCcState } from "app/codeCharta/util/indexedDB/indexedDBWriter"

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
			this.loadFilesFromIndexedDB()
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

	private async loadFilesFromIndexedDB() {
		try {
			const state = await loadCcState()
			if (state) {
				const files = state.files
				if (files.length > 0) {
					this.validateAndApplyFileStates(files)
				}
			} else {
				this.loadSampleFiles()
			}
		} catch (error) {
			const title = "Files could not be loaded from indexeddb. Loaded sample files instead."
			const message = (error as Error).message
			this.dialog.open(ErrorDialogComponent, {
				data: { title, message }
			})
			this.loadSampleFiles()
		}
	}

	private validateAndApplyFileStates(files: FileState[]) {
		const fileValidationResults = validateFileStates(files)
		const errors = fileValidationResults.filter(validationResult => validationResult.errors.length > 0)
		const errorMessages = buildErrorMessages(fileValidationResults)
		const warnigns = fileValidationResults.filter(validationResult => validationResult.warnings.length > 0)
		const warningMessages = buildWarningsMessages(fileValidationResults)

		if (errors.length > 0) {
			throw new Error(errorMessages.join(""))
		} else if (warnigns.length > 0) {
			const title = "Files loaded from indexeddb contain warnings"
			const message = warningMessages.join("")
			this.dialog.open(ErrorDialogComponent, {
				data: { title, message }
			})
		}
		this.store.dispatch(setFiles({ value: files }))
		GlobalSettingsHelper.setGlobalSettingsOfLocalStorageIfExists(this.store, this.state.getValue().appSettings)
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
