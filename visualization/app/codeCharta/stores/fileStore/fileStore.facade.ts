/**
 * Public surface of fileStore — THE cc.json source home. Outside code reaches it only through this
 * barrel (enforced by `filestore-external-access-only-via-facade`); the `store/` ngrx internals, the
 * `repos/` data-access seam and the `loaders/` ingestion boundary stay private.
 *
 * Exports are sorted by module path (Biome `organizeImports`), so they no longer sit in role-ordered
 * blocks. The surface serves four audiences:
 *   - LOAD PIPELINE — `LoadFileService`, `UrlExtractor`, `getCCFile*`, `getContentChecksum`,
 *     `getNameDataPair`, `buildHtmlMessage`, `sampleFile1`/`sampleFile2`, and the `NameDataPair`
 *     wire-DTO type (re-exported so the load orchestrator can type its ingestion handoff without
 *     importing the wire DTO directly — `wire-dto-only-in-filestore-boundary`).
 *   - READ selectors — `filesSelector`, `referenceFileSelector`, `visibleFileStatesSelector`,
 *     `isDeltaStateSelector`, `areMultipleMapsVisibleSelector`, `isLoadingFileSelector`.
 *   - WRITE action creators — `fileActions`, `setFiles`, `removeFiles`, `setDelta*`, `setStandard`,
 *     `switchReferenceAndComparison`, `setIsLoadingFile`, `setCurrentFilesAreSampleFiles`.
 *   - STORE WIRING — the slice reducers + defaults the `rootStore` composition registers
 *     (`files`/`defaultFiles`, `isLoadingFile`/`defaultIsLoadingFile`,
 *     `currentFilesAreSampleFiles`/`defaultCurrentFilesAreSampleFiles`).
 */
export type { NameDataPair } from "../../model/codeCharta.api.model"
export { sampleFile1, sampleFile2 } from "./loaders/ccJson/sampleFiles"
export { LoadFileService, NO_FILES_LOADED_ERROR_MESSAGE } from "./loaders/ccJson/services/loadFile.service"
export { buildHtmlMessage } from "./loaders/ccJson/services/loadFilesValidationToErrorDialog"
export { getCCFile, getCCFileAndDecorateFileChecksum, getContentChecksum } from "./loaders/ccJson/util/ccFileHelper"
export { getNameDataPair } from "./loaders/ccJson/util/fileParser"
export { UrlExtractor } from "./loaders/ccJson/util/urlExtractor"
export { areMultipleMapsVisibleSelector } from "./store/areMultipleMapsVisible.selector"
export { setCurrentFilesAreSampleFiles } from "./store/currentFilesAreSampleFiles/currentFilesAreSampleFiles.actions"
export {
    currentFilesAreSampleFiles,
    defaultCurrentFilesAreSampleFiles
} from "./store/currentFilesAreSampleFiles/currentFilesAreSampleFiles.reducer"
export {
    fileActions,
    removeFiles,
    setDelta,
    setDeltaComparison,
    setDeltaReference,
    setFiles,
    setStandard,
    switchReferenceAndComparison
} from "./store/files.actions"
export { defaultFiles, files } from "./store/files.reducer"
export { filesSelector } from "./store/files.selector"
export { isDeltaStateSelector } from "./store/isDeltaState.selector"
export { setIsLoadingFile } from "./store/isLoadingFile/isLoadingFile.actions"
export { defaultIsLoadingFile, isLoadingFile } from "./store/isLoadingFile/isLoadingFile.reducer"
export { isLoadingFileSelector } from "./store/isLoadingFile/isLoadingFile.selector"
export { referenceFileSelector } from "./store/referenceFile.selector"
export { visibleFileStatesSelector } from "./store/visibleFileStates.selector"
