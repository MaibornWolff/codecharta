import { Injectable, Inject } from "@angular/core"
import { MatDialog } from "@angular/material/dialog"
import { HttpClient } from "@angular/common/http"
import { NameDataPair } from "../../codeCharta.model"
import { getCCFiles } from "../../model/files/files.helper"
import { State } from "../../state/angular-redux/state"
import { Store } from "../../state/angular-redux/store"
import { setDelta, setStandard } from "../../state/store/files/files.actions"
import { ErrorDialogComponent } from "../../ui/dialogs/errorDialog/errorDialog.component"
import { GlobalSettingsHelper } from "../../util/globalSettingsHelper"
import { LoadFileService } from "../loadFile/loadFile.service"
import { UrlExtractor } from "./urlExtractor"
import sample1 from "../../assets/sample1.cc.json"
import sample2 from "../../assets/sample2.cc.json"
import { ExportCCFile } from "../../codeCharta.api.model"

@Injectable({ providedIn: "root" })
export class LoadInitialFileService {
	private urlUtils = new UrlExtractor(this.httpClient)

	constructor(
		@Inject(Store) private store: Store,
		@Inject(State) private state: State,
		@Inject(MatDialog) private dialog: MatDialog,
		@Inject(LoadFileService) private loadFileService,
		@Inject(HttpClient) private httpClient: HttpClient
	) {}

	async loadFileOrSample() {
		try {
			const data = await this.urlUtils.getFileDataFromQueryParam()
			this.tryLoadingFiles(data)
			this.setRenderStateFromUrl()
		} catch (error) {
			this.tryLoadingSampleFiles(error)
		}
	}

	private tryLoadingSampleFiles(error: Error & { statusText?: string; status?: number }) {
		if (this.urlUtils.getParameterByName("file")) {
			const message = "One or more files from the given file URL parameter could not be loaded. Loading sample files instead."
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
		this.tryLoadingFiles([
			{ fileName: "sample1.cc.json", fileSize: 3 * 1024, content: sample1 as ExportCCFile },
			{ fileName: "sample2.cc.json", fileSize: 2 * 1024, content: sample2 as ExportCCFile }
		])
	}

	private tryLoadingFiles(values: NameDataPair[]) {
		GlobalSettingsHelper.setGlobalSettingsOfLocalStorageIfExists(this.store, this.state.getValue().appSettings)
		this.loadFileService.loadFiles(values)
	}

	// TODO: Please make sure that this function works fine on Github pages with
	//  the updated file selection (no more single mode!)
	private setRenderStateFromUrl() {
		const renderState = this.urlUtils.getParameterByName("mode")
		const files = getCCFiles(this.state.getValue().files)

		if (renderState === "Delta" && files.length >= 2) {
			this.store.dispatch(setDelta(files[0], files[1]))
		} else {
			this.store.dispatch(setStandard(files))
		}
	}
}
