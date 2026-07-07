/**
 * FileStore store module entry — the single import surface for the files slice (reducer/actions/
 * selectors), moved here from `state/store/files` + `state/selectors/visibleFileStates`. The repo and
 * facade read from here; the internal ngrx selector/effect graph still imports the individual modules
 * directly via their new paths (routing memoized selectors through the facade is a later slice).
 */
export { files, defaultFiles } from "./files.reducer"
export {
    setFiles,
    addFile,
    removeFiles,
    setStandard,
    setStandardByNames,
    switchReferenceAndComparison,
    setDeltaComparison,
    setDeltaReference,
    setDelta,
    fileActions
} from "./files.actions"
export { filesSelector } from "./files.selector"
export { visibleFileStatesSelector } from "./visibleFileStates.selector"
