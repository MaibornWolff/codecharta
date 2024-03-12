import { HttpClient } from "@angular/common/http"
import { Component, ViewEncapsulation } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { LoadFileService } from "../../../services/loadFile/loadFile.service"
import { LoadInitialFileService, sampleFile1, sampleFile2 } from "../../../services/loadInitialFile/loadInitialFile.service"
import { UrlExtractor } from "../../../services/loadInitialFile/urlExtractor"
import { setState } from "../../../state/store/state.actions"
import { defaultState } from "../../../state/store/state.manager"
import { deleteCcState } from "../../../util/indexedDB/indexedDBWriter"

@Component({
	templateUrl: "./confirmResetMapDialog.component.html",
	styleUrls: ["./confirmResetMapDialog.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class ConfirmResetMapDialogComponent {
	private urlUtils = new UrlExtractor(this.httpClient)

	constructor(
		private store: Store<CcState>,
		private httpClient: HttpClient,
		private loadFileService: LoadFileService,
		private loadInitialFileService: LoadInitialFileService
	) {}

	async resetMap() {
		await deleteCcState()

		this.store.dispatch(setState({ value: defaultState }))

		const isFileQueryParameterPresent = this.loadInitialFileService.checkFileQueryParameterPresent()
		if (isFileQueryParameterPresent) {
			const urlNameDataPairs = await this.urlUtils.getFileDataFromQueryParam()
			this.loadFileService.loadFiles(urlNameDataPairs)
			this.loadInitialFileService.setRenderStateFromUrl()
		} else {
			this.loadFileService.loadFiles([sampleFile1, sampleFile2])
		}
	}
}
