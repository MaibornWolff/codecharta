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
    "domainState.rotationRange"
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

        applyTo[key] = isReplacedWholesale(value, composedJoinedPath)
            ? value
            : _applyPartialState({ ...applyTo[key] }, value, newComposedPath)
    }

    return applyTo
}

// A deep-merge spread would turn an array into an object with numeric keys.
function isReplacedWholesale(value: unknown, path: string): boolean {
    return typeof value !== "object" || Array.isArray(value) || objectWithDynamicKeysInStore.has(path)
}

function isKeyOf<T>(of: T, key: PropertyKey): key is keyof T {
    return Object.hasOwn(of as object, key)
}
