import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { dequal } from "dequal"
import { CcState } from "../model/codeCharta.model"
import { FileState } from "../model/files/files"
import {
    buildHtmlMessage,
    FilesLoadedPayload,
    FilesLoadedSource,
    filesLoaded,
    getContentChecksum,
    getNameDataPair,
    LoadFileService,
    NameDataPair,
    NO_FILES_LOADED_ERROR_MESSAGE,
    RestoredSettings,
    sampleFile1,
    sampleFile2,
    setIsLoadingFile,
    UrlExtractor
} from "../stores/fileStore/fileStore.facade"
import { clearLoadPhase, setLoadPhase } from "../util/busy/loadPhase"
import { ErrorDialogService } from "../util/errorDialog/errorDialog.service"
import { fileRoot } from "../util/fileRoot"
import { nextPaint } from "../util/nextPaint"
import { NO_URL_METRICS, UrlMetricSelection } from "../util/queryParameter/queryParameter"
import { QueryParamsService } from "../util/queryParameter/queryParams.service"
import { LoadInitialFileStore } from "./loadInitialFile.store"
import { CcStatePersistence, PersistedCcStateRead } from "./services/ccStatePersistence"

const URL_LOAD_ERROR_TITLE = "File(s) could not be loaded from the given file URL parameter. Loaded sample files instead."
const INDEXED_DB_LOAD_ERROR_TITLE = "Previously loaded files and settings could not be restored. Loaded sample files instead."
const MISSING_PROPERTIES_ERROR_TITLE =
    "The previous state could not be fully restored after loading the page. The following properties were not restored."

const RESTORING_SESSION_PHASE = "Restoring your session"
const BUILDING_MAP_PHASE = "Building the map"

@Injectable({ providedIn: "root" })
export class LoadFilesUseCase {
    constructor(
        private readonly store: Store<CcState>,
        private readonly loadFileService: LoadFileService,
        private readonly loadInitialFileStore: LoadInitialFileStore,
        private readonly errorDialogService: ErrorDialogService,
        private readonly urlExtractor: UrlExtractor,
        private readonly queryParamsService: QueryParamsService,
        private readonly ccStatePersistence: CcStatePersistence
    ) {}

    async loadOnBoot(): Promise<void> {
        this.store.dispatch(setIsLoadingFile({ value: true }))
        setLoadPhase(RESTORING_SESSION_PHASE)

        const persisted = await this.ccStatePersistence.read()

        await (this.queryParamsService.hasFile() ? this.loadFromUrl(persisted) : this.loadFromIndexedDb(persisted))
    }

    async loadFromUpload(readNameDataPairs: () => Promise<NameDataPair[]>): Promise<void> {
        this.store.dispatch(setIsLoadingFile({ value: true }))

        try {
            const nameDataPairs = await readNameDataPairs()
            if (nameDataPairs.length === 0) {
                this.store.dispatch(setIsLoadingFile({ value: false }))
                return
            }
            // The phase has to reach the screen first: the build that follows runs as one blocking step.
            setLoadPhase(BUILDING_MAP_PHASE)
            await nextPaint()
            this.commit(nameDataPairs, this.provenance("upload", { areSampleFiles: false }))
        } catch {
            // Nothing reached the store, so no render will come to clear the indicator.
            this.store.dispatch(setIsLoadingFile({ value: false }))
            clearLoadPhase()
        }
    }

    async reloadAfterReset(): Promise<void> {
        this.store.dispatch(setIsLoadingFile({ value: true }))

        if (!this.queryParamsService.hasFile()) {
            this.loadSampleFiles(null, "reset")
            return
        }

        try {
            const urlNameDataPairs = await this.urlExtractor.getFileDataFromFileNames(this.queryParamsService.getFileNames())
            const urlMetrics = this.urlMetrics()
            this.commit(urlNameDataPairs, this.provenance("reset", { areSampleFiles: false, urlMetrics }))
            this.applyRenderModeFromUrl()
            this.applySampleFileFlagFromUrl()
        } catch (error) {
            this.showUrlLoadErrorDialog(error as Error)
            this.loadSampleFiles(null, "reset")
        }
    }

    private async loadFromUrl(persisted: PersistedCcStateRead): Promise<void> {
        const urlMetrics = this.urlMetrics()

        try {
            if (persisted.error) {
                throw persisted.error
            }

            const urlNameDataPairs = await this.urlExtractor.getFileDataFromFileNames(this.queryParamsService.getFileNames())
            const savedCcState = persisted.state

            if (!savedCcState) {
                this.commit(urlNameDataPairs, this.provenance("url", { areSampleFiles: false, urlMetrics }))
                this.applyRenderModeFromUrl()
                return
            }

            const savedFileStates = savedCcState.files
            const savedNameDataPairs = savedFileStates.map(fileState => getNameDataPair(fileState.file))

            if (this.describeTheSameFiles(urlNameDataPairs, savedNameDataPairs)) {
                this.applySettingsAndFilesFromSavedState(savedFileStates, savedCcState, "url", urlMetrics)
            } else {
                this.applyAllSettings(savedCcState)
                this.commit(urlNameDataPairs, this.provenance("url", { areSampleFiles: false, urlMetrics }))
            }

            this.applyRenderModeFromUrl()
        } catch (error) {
            this.handleUrlLoadError(error as Error, persisted.state, urlMetrics)
        } finally {
            this.applySampleFileFlagFromUrl()
        }
    }

    private async loadFromIndexedDb(persisted: PersistedCcStateRead): Promise<void> {
        try {
            if (persisted.error) {
                throw persisted.error
            }

            const savedCcState = persisted.state
            if (!savedCcState) {
                this.loadSampleFiles(null, "sample")
                return
            }

            this.applySettingsAndFilesFromSavedState(savedCcState.files, savedCcState, "indexedDB", NO_URL_METRICS)
        } catch (error) {
            this.handleIndexedDbLoadError(error as Error, persisted.state)
        }
    }

    /** `filesLoaded` goes last, in the same task as the setFiles it triggers: the reconciliation picks it out of that burst. */
    private commit(nameDataPairs: NameDataPair[], provenance: FilesLoadedPayload): void {
        try {
            this.loadFileService.loadFiles(nameDataPairs)
        } catch (error) {
            if ((error as Error).message === NO_FILES_LOADED_ERROR_MESSAGE) {
                // Nothing was written to the store. The caller falls back to the sample files.
                throw error
            }
            // FILES_ALREADY_LOADED: loadFiles has written the store before throwing, so the commit succeeded.
        }

        this.store.dispatch(filesLoaded(provenance))
        clearLoadPhase()
    }

    private loadSampleFiles(
        savedCcState: CcState | null,
        source: FilesLoadedSource,
        urlMetrics: UrlMetricSelection = NO_URL_METRICS
    ): void {
        try {
            if (savedCcState) {
                this.applyAllSettings(savedCcState)
            }
        } catch {
            // A broken persisted state must not stop the sample files from loading.
        }

        this.commit([sampleFile1, sampleFile2], this.provenance(source, { areSampleFiles: true, urlMetrics }))

        // loadFiles clears the flag from inside the parser, so it has to be set after the commit.
        this.loadInitialFileStore.setCurrentFilesAreSampleFiles(true)
    }

    private applySettingsAndFilesFromSavedState(
        savedFileStates: FileState[],
        savedCcState: CcState,
        source: FilesLoadedSource,
        urlMetrics: UrlMetricSelection
    ): void {
        const missingProperties = []

        // The very first map is fitted once even when the user turned the camera reset off.
        const forceAutoFit = !savedCcState.preferences.resetCameraIfNewFileIsLoaded

        // Applied up front: the persisted metric selection has to be in the store before the reconciliation resolves it.
        missingProperties.push(
            ...this.loadInitialFileStore.applyPreferences(savedCcState.preferences),
            ...this.loadInitialFileStore.applyMapState(savedCcState.mapState),
            ...this.loadInitialFileStore.applyDomainState(savedCcState.domainState)
        )

        // The reconciliation applies the view slices after its file-derived merge, which would otherwise erase them.
        const restoredSettings: RestoredSettings = {
            sharedView: savedCcState.sharedView,
            metricsLensSource: savedCcState.metricsLensSource,
            dependencyLensSource: savedCcState.dependencyLensSource,
            domainLensSource: savedCcState.domainLensSource
        }
        missingProperties.push(
            ...this.loadInitialFileStore.missingKeysOfSharedView(savedCcState.sharedView),
            ...this.loadInitialFileStore.missingKeysOfMetricsLensSource(savedCcState.metricsLensSource),
            ...this.loadInitialFileStore.missingKeysOfDependencyLensSource(savedCcState.dependencyLensSource),
            ...this.loadInitialFileStore.missingKeysOfDomainLensSource(savedCcState.domainLensSource)
        )

        this.commitRestoredFiles(
            savedFileStates,
            this.provenance(source, { areSampleFiles: false, urlMetrics, forceAutoFit, restoredSettings })
        )

        this.showMissingPropertiesDialog(missingProperties)
    }

    /**
     * Restored files were already parsed, validated and decorated by the load that produced them, so they
     * are set directly: re-parsing would build a second copy of every map only to replace it with these.
     */
    private commitRestoredFiles(savedFileStates: FileState[], provenance: FilesLoadedPayload): void {
        if (savedFileStates.length === 0) {
            throw new Error(NO_FILES_LOADED_ERROR_MESSAGE)
        }

        // Only LoadFileService does this otherwise, from the file it parses — and the root path keys the
        // domain words, the exclusions and every node lookup.
        fileRoot.updateRoot(savedFileStates[0].file.map.name)
        this.loadInitialFileStore.setFiles(savedFileStates)
        this.store.dispatch(filesLoaded(provenance))
        clearLoadPhase()
    }

    private applyAllSettings(savedCcState: CcState): void {
        const missingProperties = []

        if (savedCcState.metricsLensSource) {
            missingProperties.push(...this.loadInitialFileStore.applyMetricsLensSource(savedCcState.metricsLensSource))
        }
        if (savedCcState.dependencyLensSource) {
            missingProperties.push(...this.loadInitialFileStore.applyDependencyLensSource(savedCcState.dependencyLensSource))
        }
        if (savedCcState.domainLensSource) {
            missingProperties.push(...this.loadInitialFileStore.applyDomainLensSource(savedCcState.domainLensSource))
        }
        if (savedCcState.preferences) {
            missingProperties.push(...this.loadInitialFileStore.applyPreferences(savedCcState.preferences))
        }
        if (savedCcState.sharedView) {
            missingProperties.push(...this.loadInitialFileStore.applySharedView(savedCcState.sharedView))
        }
        if (savedCcState.mapState) {
            missingProperties.push(...this.loadInitialFileStore.applyMapState(savedCcState.mapState))
        }
        if (savedCcState.domainState) {
            missingProperties.push(...this.loadInitialFileStore.applyDomainState(savedCcState.domainState))
        }

        this.showMissingPropertiesDialog(missingProperties)
    }

    private urlMetrics(): UrlMetricSelection {
        return this.queryParamsService.getMetrics()
    }

    private applyRenderModeFromUrl(): void {
        this.loadInitialFileStore.setRenderState(this.queryParamsService.getRenderMode())
    }

    private applySampleFileFlagFromUrl(): void {
        if (this.queryParamsService.areSampleFilesFlagged()) {
            this.loadInitialFileStore.setCurrentFilesAreSampleFiles(true)
        }
    }

    private provenance(
        source: FilesLoadedSource,
        options: {
            areSampleFiles: boolean
            urlMetrics?: UrlMetricSelection
            forceAutoFit?: boolean
            restoredSettings?: RestoredSettings
        }
    ): FilesLoadedPayload {
        return {
            source,
            areSampleFiles: options.areSampleFiles,
            urlMetrics: options.urlMetrics ?? NO_URL_METRICS,
            forceAutoFit: options.forceAutoFit ?? false,
            // A reset deliberately discards the previous selection, so the metrics must fall back to the
            // computed default even when the old selection is still available in the reloaded files.
            forceDefaultMetrics: source === "reset",
            restoredSettings: options.restoredSettings ?? null
        }
    }

    private describeTheSameFiles(left: NameDataPair[], right: NameDataPair[]): boolean {
        const leftChecksums = left.map(pair => getContentChecksum(pair.content))
        const rightChecksums = right.map(pair => getContentChecksum(pair.content))
        return dequal(leftChecksums, rightChecksums)
    }

    private handleUrlLoadError(error: Error, savedCcState: CcState | null, urlMetrics: UrlMetricSelection): void {
        if (error.message !== NO_FILES_LOADED_ERROR_MESSAGE) {
            this.showUrlLoadErrorDialog(error)
        }
        this.loadSampleFiles(savedCcState, "sample", urlMetrics)
    }

    private handleIndexedDbLoadError(error: Error, savedCcState: CcState | null): void {
        if (error.message !== NO_FILES_LOADED_ERROR_MESSAGE) {
            this.errorDialogService.open({ title: INDEXED_DB_LOAD_ERROR_TITLE, message: error.message })
        }
        this.loadSampleFiles(savedCcState, "sample")
    }

    private showUrlLoadErrorDialog(error: Error & { statusText?: string; status?: number }): void {
        this.errorDialogService.open({ title: URL_LOAD_ERROR_TITLE, message: this.buildUrlErrorMessage(error) })
    }

    private buildUrlErrorMessage(error: Error & { statusText?: string; status?: number }): string {
        let message = "Error"
        if (error.message) {
            message += ` (${error.message})`
        } else if (error.statusText && error.status) {
            message += ` (${error.status}: ${error.statusText})`
        }
        return message
    }

    private showMissingPropertiesDialog(missingProperties: string[]): void {
        if (missingProperties.length === 0) {
            return
        }
        const warningSymbol = '<i class="fa fa-exclamation-triangle"></i> '
        this.errorDialogService.open({
            title: MISSING_PROPERTIES_ERROR_TITLE,
            message: buildHtmlMessage(warningSymbol, missingProperties)
        })
    }
}
