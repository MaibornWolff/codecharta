import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import stringify from "safe-stable-stringify"
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
import { ErrorDialogService } from "../util/errorDialog/errorDialog.service"
import { NO_URL_METRICS, UrlMetricSelection } from "../util/queryParameter/queryParameter"
import { QueryParamsService } from "../util/queryParameter/queryParams.service"
import { LoadInitialFileStore } from "./loadInitialFile.store"
import { CcStatePersistence, PersistedCcStateRead } from "./services/ccStatePersistence"

const URL_LOAD_ERROR_TITLE = "File(s) could not be loaded from the given file URL parameter. Loaded sample files instead."
const INDEXED_DB_LOAD_ERROR_TITLE = "Previously loaded files and settings could not be restored. Loaded sample files instead."
const MISSING_PROPERTIES_ERROR_TITLE =
    "The previous state could not be fully restored after loading the page. The following properties were not restored."

/**
 * The single entry point for loading files. Every source — the ?file= URL, IndexedDB, the sample
 * files, a file-picker upload, the reset-map dialog — goes through here.
 *
 * It owns the decision tree around LoadFileService.loadFiles (which owns parse/validate/setFiles),
 * raises the loading indicator, and emits exactly one `filesLoaded` action per load carrying the
 * provenance the post-load reconciliation needs.
 */
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

    /** Boot. Reads the persisted state exactly once and never rejects. */
    async loadOnBoot(): Promise<void> {
        this.store.dispatch(setIsLoadingFile({ value: true }))

        const persisted = await this.ccStatePersistence.read()

        await (this.queryParamsService.hasFile() ? this.loadFromUrl(persisted) : this.loadFromIndexedDb(persisted))
    }

    /**
     * File-picker upload. The caller owns turning the picked files into name/data pairs (that is a
     * DOM concern); the use-case owns the loading indicator around it and the commit.
     */
    async loadFromUpload(readNameDataPairs: () => Promise<NameDataPair[]>): Promise<void> {
        this.store.dispatch(setIsLoadingFile({ value: true }))

        try {
            const nameDataPairs = await readNameDataPairs()
            if (nameDataPairs.length === 0) {
                this.store.dispatch(setIsLoadingFile({ value: false }))
                return
            }
            this.commit(nameDataPairs, this.provenance("upload", { areSampleFiles: false }))
        } catch {
            // Nothing reached the store, so no render will come to clear the indicator.
            this.store.dispatch(setIsLoadingFile({ value: false }))
        }
    }

    /** Reset-map dialog. The caller has already wiped the persisted and in-memory state. */
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

    // ───────────────────────────── the boot branches ─────────────────────────────

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
                this.applySettingsAndFilesFromSavedState(savedFileStates, savedCcState, savedNameDataPairs, "url", urlMetrics)
            } else {
                // The old path only forced a fit when it restored the SAME files; a differing file
                // set goes through the normal resetCameraIfNewFileIsLoaded gate.
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

            const savedFileStates = savedCcState.files
            const savedNameDataPairs = savedFileStates.map(fileState => getNameDataPair(fileState.file))

            this.applySettingsAndFilesFromSavedState(savedFileStates, savedCcState, savedNameDataPairs, "indexedDB", NO_URL_METRICS)
        } catch (error) {
            this.handleIndexedDbLoadError(error as Error, persisted.state)
        }
    }

    // ───────────────────────────── the shared sink ─────────────────────────────

    /**
     * Runs the load and emits `filesLoaded` LAST, synchronously, in the same task as the setFiles /
     * setStandardByNames it triggers. The post-load reconciliation relies on that ordering to pick
     * the provenance-carrying action out of the burst.
     */
    private commit(nameDataPairs: NameDataPair[], provenance: FilesLoadedPayload): void {
        try {
            this.loadFileService.loadFiles(nameDataPairs)
        } catch (error) {
            if ((error as Error).message === NO_FILES_LOADED_ERROR_MESSAGE) {
                // Nothing was written to the store. The caller falls back to the sample files.
                throw error
            }
            // FILES_ALREADY_LOADED: loadFiles HAS written the store before throwing, so this is a
            // successful commit — swallow, and let the reconciliation run as it would otherwise.
        }

        this.store.dispatch(filesLoaded(provenance))
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

    // ───────────────────────────── persisted settings ─────────────────────────────

    private applySettingsAndFilesFromSavedState(
        savedFileStates: FileState[],
        savedCcState: CcState,
        savedNameDataPairs: NameDataPair[],
        source: FilesLoadedSource,
        urlMetrics: UrlMetricSelection
    ): void {
        const missingProperties = []

        // The very first map is fitted once even when the user turned the camera reset off — the
        // autofit step reads this off the provenance.
        const forceAutoFit = !savedCcState.preferences.resetCameraIfNewFileIsLoaded

        // Preferences and mapState are applied up front: the metric selection has to be in the store
        // before the reconciliation resolves it, since the persisted selection is one of the candidates.
        missingProperties.push(...this.loadInitialFileStore.applyPreferences(savedCcState.preferences))
        missingProperties.push(...this.loadInitialFileStore.applyMapState(savedCcState.mapState))

        // The view slices are NOT applied here. They are carried on the provenance and applied by the
        // reconciliation AFTER its file-derived merge, because persisted beats file-derived: a user's
        // exclusions, marked packages and focus exist only in the persisted state, so merging the files'
        // own settings on top of them would erase them.
        const restoredSettings: RestoredSettings = {
            sharedView: savedCcState.sharedView,
            metricsLensSource: savedCcState.metricsLensSource,
            dependencyLensSource: savedCcState.dependencyLensSource
        }
        missingProperties.push(...this.loadInitialFileStore.missingKeysOfSharedView(savedCcState.sharedView))
        missingProperties.push(...this.loadInitialFileStore.missingKeysOfMetricsLensSource(savedCcState.metricsLensSource))
        missingProperties.push(...this.loadInitialFileStore.missingKeysOfDependencyLensSource(savedCcState.dependencyLensSource))

        this.commit(savedNameDataPairs, this.provenance(source, { areSampleFiles: false, urlMetrics, forceAutoFit, restoredSettings }))
        this.loadInitialFileStore.setFiles(savedFileStates)

        this.showMissingPropertiesDialog(missingProperties)
    }

    private applyAllSettings(savedCcState: CcState): void {
        const missingProperties = []

        if (savedCcState.metricsLensSource) {
            missingProperties.push(...this.loadInitialFileStore.applyMetricsLensSource(savedCcState.metricsLensSource))
        }
        if (savedCcState.dependencyLensSource) {
            missingProperties.push(...this.loadInitialFileStore.applyDependencyLensSource(savedCcState.dependencyLensSource))
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

        this.showMissingPropertiesDialog(missingProperties)
    }

    // ───────────────────────────── url ─────────────────────────────

    private urlMetrics(): UrlMetricSelection {
        return this.queryParamsService.getMetrics()
    }

    // "Delta" is the only recognized value, and only with at least two loaded files.
    // Anything else — including the removed single-file mode — falls through to the default state.
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
        return stringify(leftChecksums) === stringify(rightChecksums)
    }

    // ───────────────────────────── errors ─────────────────────────────

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
