import { HttpClient } from "@angular/common/http"
import { Component, ViewEncapsulation } from "@angular/core"
import { Store } from "@ngrx/store"
import { first, tap } from "rxjs"
import { CcState } from "../../../codeCharta.model"
import { LoadFileService } from "../../../services/loadFile/loadFile.service"
import { LoadInitialFileService, sampleFile1, sampleFile2 } from "../../../services/loadInitialFile/loadInitialFile.service"
import { UrlExtractor } from "../../../services/loadInitialFile/urlExtractor"
import { setDefaultMetrics } from "../../../state/effects/resetChosenMetrics/resetChosenMetrics.effect"
import { metricDataSelector } from "../../../state/selectors/accumulatedData/metricData/metricData.selector"
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
            try {
                const urlNameDataPairs = await this.urlUtils.getFileDataFromQueryParam()
                this.loadFileService.loadFiles(urlNameDataPairs)
                this.loadInitialFileService.setRenderStateFromUrl()
            } catch {
                this.loadFileService.loadFiles([sampleFile1, sampleFile2])
            }
        } else {
            this.loadFileService.loadFiles([sampleFile1, sampleFile2])
        }

        this.resetMetrics()
    }

    private resetMetrics() {
        this.store
            .select(metricDataSelector)
            .pipe(
                first(),
                tap(metricData => {
                    const nodeMetricData = metricData.nodeMetricData
                    setDefaultMetrics(this.store, nodeMetricData)
                })
            )
            .subscribe()
    }
}
