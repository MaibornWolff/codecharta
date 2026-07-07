export { LoadFileService, NO_FILES_LOADED_ERROR_MESSAGE } from "./loaders/ccJson/services/loadFile.service"
export { sampleFile1, sampleFile2 } from "./loaders/ccJson/sampleFiles"
export { getNameDataPair } from "./loaders/ccJson/util/fileParser"
export { getCCFile, getCCFileAndDecorateFileChecksum, getContentChecksum } from "./loaders/ccJson/util/ccFileHelper"
export { UrlExtractor } from "./loaders/ccJson/util/urlExtractor"
export { buildHtmlMessage } from "./loaders/ccJson/services/loadFilesValidationToErrorDialog"
// The cc.json wire-DTO name/data pair type — re-exported here so the load orchestrator can type its
// ingestion handoff without importing the wire DTO directly (wire-dto-only-in-filestore-boundary).
export type { NameDataPair } from "../../model/codeCharta.api.model"

// ── files-slice store surface ──────────────────────────────────────────────────────────────────────
// The public read/write surface of the files slice, re-exported so every consumer reaches it through
// this facade (enforced by filestore-external-access-only-via-facade) instead of the store/ internals.
// READ selectors:
export { filesSelector } from "./store/files.selector"
export { referenceFileSelector } from "./store/referenceFile.selector"
export { visibleFileStatesSelector } from "./store/visibleFileStates.selector"
export { isDeltaStateSelector } from "./store/isDeltaState.selector"
export { areMultipleMapsVisibleSelector } from "./store/areMultipleMapsVisible.selector"
export { isLoadingFileSelector } from "./store/isLoadingFile/isLoadingFile.selector"
// WRITE action creators:
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
export { setIsLoadingFile } from "./store/isLoadingFile/isLoadingFile.actions"
export { setCurrentFilesAreSampleFiles } from "./store/currentFilesAreSampleFiles/currentFilesAreSampleFiles.actions"
// Store wiring — the slice reducers + defaults the rootStore composition registers (twin of how the
// other homes are wired through their read facade):
export { files, defaultFiles } from "./store/files.reducer"
export { isLoadingFile, defaultIsLoadingFile } from "./store/isLoadingFile/isLoadingFile.reducer"
export { currentFilesAreSampleFiles, defaultCurrentFilesAreSampleFiles } from "./store/currentFilesAreSampleFiles/currentFilesAreSampleFiles.reducer"
