import { defaultPreferences } from "../stores/preferences/preferences.read.facade"
import { defaultFiles } from "../stores/fileStore/store/files.reducer"
import { defaultIsLoadingFile } from "../stores/fileStore/store/isLoadingFile/isLoadingFile.reducer"
import { defaultCurrentFilesAreSampleFiles } from "../stores/fileStore/store/currentFilesAreSampleFiles/currentFilesAreSampleFiles.reducer"
import { defaultMapState } from "../stores/mapState/mapState.read.facade"
import { defaultSharedView } from "../stores/sharedView/sharedView.read.facade"
import { defaultMetricsLensSource } from "../lenses/metrics/metricsLens.load.facade"
import { defaultDependencyLensSource } from "../lenses/dependency/dependencyLens.load.facade"
import { CcState } from "../model/codeCharta.model"

export const defaultState: CcState = {
    metricsLensSource: defaultMetricsLensSource,
    dependencyLensSource: defaultDependencyLensSource,
    preferences: defaultPreferences,
    mapState: defaultMapState,
    sharedView: defaultSharedView,
    files: defaultFiles,
    isLoadingFile: defaultIsLoadingFile,
    currentFilesAreSampleFiles: defaultCurrentFilesAreSampleFiles
}

const objectWithDynamicKeysInStore = new Set([
    "metricsLensSource.attributeTypes",
    "metricsLensSource.attributeDescriptors",
    "dependencyLensSource.attributeTypes",
    // arrays: must be replaced wholesale, otherwise the deep-merge spread turns them into objects with numeric keys
    "sharedView.blacklist",
    "sharedView.markedPackages",
    "sharedView.focusedNodePath",
    // an array: must be replaced wholesale, otherwise the deep-merge spread turns it into an object with numeric keys
    "mapState.mapColors.markingColors",
    "files" // ToDo; this should be a Map with an unique id
])

export function _applyPartialState<T>(applyTo: T, toBeApplied: unknown, composedPath = []): T {
    for (const [key, value] of Object.entries(toBeApplied)) {
        if (value === null || value === undefined) {
            continue
        }

        if (!isKeyOf(applyTo, key)) {
            continue
        }

        const newComposedPath = [...composedPath, key]
        const composedJoinedPath = newComposedPath.join(".")

        applyTo[key] =
            typeof value !== "object" || objectWithDynamicKeysInStore.has(composedJoinedPath)
                ? value
                : _applyPartialState({ ...applyTo[key] }, value, newComposedPath)
    }

    return applyTo
}

function isKeyOf<T>(of: T, key: PropertyKey): key is keyof T {
    return Object.prototype.hasOwnProperty.call(of, key)
}
