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

	async loadFilesOrSamples() {
		try {
			await this.loadFilesFromQueryParam()
		} catch (error) {
			this.handleErrorLoadFilesFromQueryParam(error as Error)
		}
	}

	private async loadFilesFromQueryParam() {
		const data = await this.urlUtils.getFileDataFromQueryParam()
		this.loadFiles(data)
		this.setRenderStateFromUrl()
	}

	private handleErrorLoadFilesFromQueryParam(error: Error) {
		if (this.urlUtils.getParameterByName("file")) {
			const message =
				"One or more files from the given file URL parameter could not be loaded. Loading files from local storage instead."
			this.showErrorDialog(error as Error & { statusText?: string; status?: number }, message)
		}
		this.loadFilesFromLocalStorage()
	}

	private loadFilesFromLocalStorage() {
		try {
			const files: FileState[] = this.readFilesFromLocalStorage()
			this.store.dispatch(setFiles({ value: files }))
		} catch (error) {
			this.handleErrorLoadFilesFromLocalStorage(error as Error)
		}
	}

	private handleErrorLoadFilesFromLocalStorage(error: Error) {
		if (localStorage.getItem(FILES_LOCAL_STORAGE_ELEMENT)) {
			const message = "Files could not be loaded from local storage. Loading sample files instead."
			this.showErrorDialog(error as Error & { statusText?: string; status?: number }, message)
		}
		this.loadSampleFiles()
	}

	private readFilesFromLocalStorage(): FileState[] {
		const localStorageItem = localStorage.getItem(FILES_LOCAL_STORAGE_ELEMENT)

		if (localStorageItem) {
			const parsedLocalStorageItem = JSON.parse(localStorageItem)
			const compressedFiles = parsedLocalStorageItem.files
			const decompressedFiles = pako.inflate(compressedFiles, { to: "string" })
			const files = JSON.parse(decompressedFiles) as FileState[]

			return files
		}
		throw new Error("No files found in local storage")
	}

	showErrorDialog(error: Error & { statusText?: string; status?: number }, message: string) {
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
