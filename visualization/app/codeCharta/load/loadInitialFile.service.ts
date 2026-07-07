import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import stringify from "safe-stable-stringify"
import { readCcState } from "../stores/rootStore/indexedDB/indexedDBWriter"
import { CcState } from "../model/codeCharta.model"
import { FileState } from "../model/files/files"
import { MetricQueryParemter } from "../util/queryParameter/metricQueryParameter"
import { ErrorDialogService } from "../util/errorDialog/errorDialog.service"
import {
    buildHtmlMessage,
    getContentChecksum,
    getNameDataPair,
    LoadFileService,
    NameDataPair,
    NO_FILES_LOADED_ERROR_MESSAGE,
    sampleFile1,
    sampleFile2,
    UrlExtractor
} from "../stores/fileStore/fileStore.facade"
import { LoadInitialFileStore } from "./loadInitialFile.store"

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
            const urlNameDataPairCheckSums = urlNameDataPairs.map(urlNameDataPair => getContentChecksum(urlNameDataPair.content))
            const savedNameDataPairCheckSums = savedNameDataPairs.map(savedNameDataPair => getContentChecksum(savedNameDataPair.content))
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

        if (!savedCcState.preferences.resetCameraIfNewFileIsLoaded) {
            this.loadInitialFileStore.dispatchResetCameraIfNewFileIsLoadedToFalse()
        }
        const missingPreferences = this.loadInitialFileStore.applyPreferences(savedCcState.preferences)
        missingPropertiesInSavedCcState.push(...missingPreferences)
        const missingMapState = this.loadInitialFileStore.applyMapState(savedCcState.mapState)
        missingPropertiesInSavedCcState.push(...missingMapState)

        this.loadFileService.loadFiles(savedNameDataPairs)
        this.loadInitialFileStore.setFiles(savedFileStates)

        const missingMetricsLensSource = this.loadInitialFileStore.applyMetricsLensSource(savedCcState.metricsLensSource)
        missingPropertiesInSavedCcState.push(...missingMetricsLensSource)
        const missingDependencyLensSource = this.loadInitialFileStore.applyDependencyLensSource(savedCcState.dependencyLensSource)
        missingPropertiesInSavedCcState.push(...missingDependencyLensSource)
        const missingSharedView = this.loadInitialFileStore.applySharedView(savedCcState.sharedView)
        missingPropertiesInSavedCcState.push(...missingSharedView)
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
        const savedMetricsLensSource = savedCcState.metricsLensSource
        const savedDependencyLensSource = savedCcState.dependencyLensSource
        const savedPreferences = savedCcState.preferences
        const savedSharedView = savedCcState.sharedView
        const savedMapState = savedCcState.mapState
        const missingPropertiesInSavedCcState = []
        if (savedMetricsLensSource) {
            const missingMetricsLensSource = this.loadInitialFileStore.applyMetricsLensSource(savedMetricsLensSource)
            missingPropertiesInSavedCcState.push(...missingMetricsLensSource)
        }
        if (savedDependencyLensSource) {
            const missingDependencyLensSource = this.loadInitialFileStore.applyDependencyLensSource(savedDependencyLensSource)
            missingPropertiesInSavedCcState.push(...missingDependencyLensSource)
        }
        if (savedPreferences) {
            const missingPreferences = this.loadInitialFileStore.applyPreferences(savedPreferences)
            missingPropertiesInSavedCcState.push(...missingPreferences)
        }
        if (savedSharedView) {
            const missingSharedView = this.loadInitialFileStore.applySharedView(savedSharedView)
            missingPropertiesInSavedCcState.push(...missingSharedView)
        }
        if (savedMapState) {
            const missingMapState = this.loadInitialFileStore.applyMapState(savedMapState)
            missingPropertiesInSavedCcState.push(...missingMapState)
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
