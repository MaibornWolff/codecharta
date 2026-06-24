import { HttpClient } from "@angular/common/http"
import { ChangeDetectionStrategy, Component, ElementRef, viewChild } from "@angular/core"
import { LoadFileService } from "../../../../../services/loadFile/loadFile.service"
import { LoadInitialFileService, sampleFile1, sampleFile2 } from "../../../../../services/loadInitialFile/loadInitialFile.service"
import { UrlExtractor } from "../../../../../services/loadInitialFile/urlExtractor"
import { deleteCcState } from "../../../../../util/indexedDB/indexedDBWriter"
import { MapResetStore } from "../../../stores/mapReset.store"

@Component({
    selector: "cc-confirm-reset-map-dialog",
    templateUrl: "./confirmResetMapDialog.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmResetMapDialogComponent {
    readonly dialogElement = viewChild.required<ElementRef<HTMLDialogElement>>("dialog")

    private readonly urlUtils = new UrlExtractor(this.httpClient)

    constructor(
        private readonly mapResetStore: MapResetStore,
        private readonly httpClient: HttpClient,
        private readonly loadFileService: LoadFileService,
        private readonly loadInitialFileService: LoadInitialFileService
    ) {}

    open() {
        this.dialogElement().nativeElement.showModal()
    }

    close() {
        this.dialogElement().nativeElement.close()
    }

    async confirmReset() {
        this.close()
        await this.resetMap()
    }

    async resetMap() {
        await deleteCcState()
        this.mapResetStore.resetState()

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

        this.mapResetStore.resetMetricsToDefault()
    }
}
