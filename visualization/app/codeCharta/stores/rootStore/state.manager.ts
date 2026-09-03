import { CcState } from "../../model/codeCharta.model"
import { defaultDependencyLensSource } from "../dependencyLensSource/dependencyLensSource.read.facade"
import { defaultDomainLensSource } from "../domainLensSource/domainLensSource.read.facade"
import { defaultDomainState } from "../domainState/domainState.read.facade"
import { defaultCurrentFilesAreSampleFiles, defaultFiles, defaultIsLoadingFile } from "../fileStore/fileStore.facade"
import { defaultMapState } from "../mapState/mapState.read.facade"
import { defaultMetricsLensSource } from "../metricsLensSource/metricsLensSource.read.facade"
import { defaultPreferences } from "../preferences/preferences.read.facade"
import { defaultSharedView } from "../sharedView/sharedView.read.facade"

export const defaultState: CcState = {
    metricsLensSource: defaultMetricsLensSource,
    dependencyLensSource: defaultDependencyLensSource,
    domainLensSource: defaultDomainLensSource,
    domainState: defaultDomainState,
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
    "domainLensSource.words",
    "domainState.sizeRange",
    "domainState.rotationRange",
    // an array: must be replaced wholesale, otherwise the deep-merge spread turns it into an object with numeric keys
    "domainState.hiddenWords",
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
