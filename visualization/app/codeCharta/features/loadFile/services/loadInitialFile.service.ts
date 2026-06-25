import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import stringify from "safe-stable-stringify"
import { readCcState } from "../../../util/indexedDB/indexedDBWriter"
import sample1 from "../../../assets/sample1.cc.json"
import sample2 from "../../../assets/sample2.cc.json"
import { ExportCCFile } from "../../../codeCharta.api.model"
import { CcState } from "../../../codeCharta.model"
import { NameDataPair } from "../../../codeCharta.api.model"
import { FileState } from "../../../model/files/files"
import { MetricQueryParemter } from "../../../state/effects/updateQueryParameters/metricQueryParameter"
import { ErrorDialogService } from "../../../features/shared/components/errorDialog/errorDialog.service"
import { buildHtmlMessage } from "./loadFilesValidationToErrorDialog"
import { getNameDataPair } from "../util/fileParser"
import { LoadFileService, NO_FILES_LOADED_ERROR_MESSAGE } from "./loadFile.service"
import { UrlExtractor } from "../../../util/urlExtractor"
import { LoadInitialFileStore } from "../stores/loadInitialFile.store"

export const sampleFile1 = { fileName: "sample1.cc.json", fileSize: 3 * 1024, content: sample1 as ExportCCFile }
export const sampleFile2 = { fileName: "sample2.cc.json", fileSize: 2 * 1024, content: sample2 as ExportCCFile }

@Injectable({ providedIn: "root" })
export class LoadInitialFileService {
    private readonly urlUtils = new UrlExtractor(this.httpClient)

    constructor(
        private readonly loadInitialFileStore: LoadInitialFileStore,
        private readonly errorDialogService: ErrorDialogService,
        private readonly loadFileService: LoadFileService,
        private readonly httpClient: HttpClient
    ) {}

    async loadFilesOrSampleFiles() {
        const isFileQueryParameterPresent = this.checkFileQueryParameterPresent()
        await (isFileQueryParameterPresent ? this.loadFilesFromQueryParams() : this.loadFilesFromIndexedDB())
    }

    checkFileQueryParameterPresent() {
        return Boolean(this.urlUtils.getParameterByName("file"))
    }

    private async loadFilesFromQueryParams() {
        try {
            const urlNameDataPairs = await this.urlUtils.getFileDataFromQueryParam()
            const savedCcState = await readCcState()
            if (!savedCcState) {
                this.loadFileService.loadFiles(urlNameDataPairs)
                this.setRenderStateFromUrl()
                return
            }

            const savedFileStates = savedCcState.files
            const savedNameDataPairs = savedFileStates.map(fileState => getNameDataPair(fileState.file))
            const urlNameDataPairCheckSums = urlNameDataPairs.map(urlNameDataPair => urlNameDataPair.content.fileChecksum)
            const savedNameDataPairCheckSums = savedNameDataPairs.map(savedNameDataPair => savedNameDataPair.content.fileChecksum)
            if (stringify(urlNameDataPairCheckSums) === stringify(savedNameDataPairCheckSums)) {
                this.applySettingsAndFilesFromSavedState(savedFileStates, savedCcState, savedNameDataPairs)
            } else {
                this.applySettingsFromSavedState(savedCcState, urlNameDataPairs)
            }
            this.setRenderStateFromUrl()
        } catch (error) {
            await this.handleErrorLoadFilesFromQueryParams(error as Error)
        } finally {
            this.setMetricsFromUrl()
            this.setCurrentFilesAreSampleFilesFromUrl()
        }
    }

    private applySettingsAndFilesFromSavedState(savedFileStates: FileState[], savedCcState: CcState, savedNameDataPairs: NameDataPair[]) {
        const missingPropertiesInSavedCcState = []

        if (!savedCcState.appSettings.resetCameraIfNewFileIsLoaded) {
            this.loadInitialFileStore.dispatchResetCameraIfNewFileIsLoadedToFalse()
        }
        const missingAppSettings = this.loadInitialFileStore.applyAppSettings(savedCcState.appSettings)
        missingPropertiesInSavedCcState.push(...missingAppSettings)

        this.loadFileService.loadFiles(savedNameDataPairs)
        this.loadInitialFileStore.setFiles(savedFileStates)

        const missingFileSettings = this.loadInitialFileStore.applyFileSettings(savedCcState.fileSettings)
        missingPropertiesInSavedCcState.push(...missingFileSettings)
        const missingDynamicSettings = this.loadInitialFileStore.applyDynamicSettings(savedCcState.dynamicSettings)
        missingPropertiesInSavedCcState.push(...missingDynamicSettings)
        if (missingPropertiesInSavedCcState.length > 0) {
            this.showErrorDialogForMissingProperties(missingPropertiesInSavedCcState)
        }
    }

    private applySettingsFromSavedState(savedCcState: CcState, urlNameDataPairs: NameDataPair[]) {
        this.applyAllSettings(savedCcState)
        this.loadFileService.loadFiles(urlNameDataPairs)
    }

    private showErrorDialogForMissingProperties(missingPropertiesInSavedCcState) {
        const title = "The previous state could not be fully restored after loading the page. The following properties were not restored."
        const message = this.buildMissingPropertiesMessage(missingPropertiesInSavedCcState)
        this.showErrorDialog(title, message)
    }

    private async handleErrorLoadFilesFromQueryParams(error: Error) {
        if (error.message !== NO_FILES_LOADED_ERROR_MESSAGE) {
            const title = "File(s) could not be loaded from the given file URL parameter. Loaded sample files instead."
            const message = this.createTitleUrlErrorDialog(error)
            this.showErrorDialog(title, message)
        }
        await this.loadSampleFiles()
    }

    private async loadFilesFromIndexedDB() {
        try {
            const savedCcState = await readCcState()
            if (!savedCcState) {
                await this.loadSampleFiles()
                return
            }

            const savedFileStates = savedCcState.files
            const savedNameDataPairs = savedFileStates.map(fileState => getNameDataPair(fileState.file))
            this.applySettingsAndFilesFromSavedState(savedFileStates, savedCcState, savedNameDataPairs)
        } catch (error) {
            await this.handleErrorLoadFilesFromIndexedDB(error as Error)
        }
    }

    private async handleErrorLoadFilesFromIndexedDB(error: Error) {
        if (error.message !== NO_FILES_LOADED_ERROR_MESSAGE) {
            const title = "Previously loaded files and settings could not be restored. Loaded sample files instead."
            const message = error.message
            this.showErrorDialog(title, message)
        }
        await this.loadSampleFiles()
    }

    private applyAllSettings(savedCcState: CcState) {
        const savedFileSettings = savedCcState.fileSettings
        const savedDynamicSettings = savedCcState.dynamicSettings
        const savedAppSettings = savedCcState.appSettings
        const missingPropertiesInSavedCcState = []
        if (savedFileSettings) {
            const missingFileSettings = this.loadInitialFileStore.applyFileSettings(savedFileSettings)
            missingPropertiesInSavedCcState.push(...missingFileSettings)
        }
        if (savedDynamicSettings) {
            const missingDynamicSettings = this.loadInitialFileStore.applyDynamicSettings(savedDynamicSettings)
            missingPropertiesInSavedCcState.push(...missingDynamicSettings)
        }
        if (savedAppSettings) {
            const missingAppSettings = this.loadInitialFileStore.applyAppSettings(savedAppSettings)
            missingPropertiesInSavedCcState.push(...missingAppSettings)
        }
        if (missingPropertiesInSavedCcState.length > 0) {
            this.showErrorDialogForMissingProperties(missingPropertiesInSavedCcState)
        }
    }

    private buildMissingPropertiesMessage(missingPropertiesInSavedCcState: string[]) {
        const warningSymbol = '<i class="fa fa-exclamation-triangle"></i> '
        return `${buildHtmlMessage(warningSymbol, missingPropertiesInSavedCcState)}`
    }

    private async loadSampleFiles() {
        try {
            const savedCcState = await readCcState()
            if (savedCcState) {
                this.applyAllSettings(savedCcState)
            }
            this.loadFileService.loadFiles([sampleFile1, sampleFile2])
        } catch {
            this.loadFileService.loadFiles([sampleFile1, sampleFile2])
        }
        this.loadInitialFileStore.setCurrentFilesAreSampleFiles(true)
    }

    private showErrorDialog(title: string, message: string) {
        this.errorDialogService.open({ title, message })
    }

    private createTitleUrlErrorDialog(error: Error & { statusText?: string; status?: number }) {
        let title = "Error"
        if (error.message) {
            title += ` (${error.message})`
        } else if (error.statusText && error.status) {
            title += ` (${error.status}: ${error.statusText})`
        }
        return title
    }

    setMetricsFromUrl() {
        const areaMetric = this.urlUtils.getParameterByName(MetricQueryParemter.areaMetric)
        const heightMetric = this.urlUtils.getParameterByName(MetricQueryParemter.heightMetric)
        const colorMetric = this.urlUtils.getParameterByName(MetricQueryParemter.colorMetric)
        const edgeMetric = this.urlUtils.getParameterByName(MetricQueryParemter.edgeMetric)
        this.loadInitialFileStore.setMetricsFromUrlValues(areaMetric, heightMetric, colorMetric, edgeMetric)
    }

    // TODO: Please make sure that this function works fine on Github pages with
    //  the updated file selection (no more single mode!)
    setRenderStateFromUrl() {
        const renderState = this.urlUtils.getParameterByName("mode")
        this.loadInitialFileStore.setRenderState(renderState)
    }

    private setCurrentFilesAreSampleFilesFromUrl() {
        const currentFilesAreSampleFiles = this.urlUtils.getParameterByName(MetricQueryParemter.currentFilesAreSampleFiles)
        if (currentFilesAreSampleFiles && currentFilesAreSampleFiles === "true") {
            this.loadInitialFileStore.setCurrentFilesAreSampleFiles(true)
        }
    }
}
