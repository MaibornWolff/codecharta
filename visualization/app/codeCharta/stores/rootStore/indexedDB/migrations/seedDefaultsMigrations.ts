import { defaultDomainLensSource } from "../../../domainLensSource/domainLensSource.read.facade"
import { defaultDomainState } from "../../../domainState/domainState.read.facade"
import {
    defaultCenterMapZoom,
    defaultRadialFolderStyle,
    defaultRadialFolderTint,
    defaultRadialFolderValue,
    defaultRadialLevels
} from "../../../preferences/preferences.read.facade"
import { defaultSharedView } from "../../../sharedView/sharedView.read.facade"
import { isPersistedRecord, seedIntoRootIfAbsent, seedRootIfAbsent, withSeededFileSetting } from "./persistedRecord"

export function migrateCcStateRecordToV17<T>(state: T): T {
    return seedRootIfAbsent(state, "domainLensSource", defaultDomainLensSource)
}

export function migrateCcStateRecordToV18<T>(state: T): T {
    return seedRootIfAbsent(state, "domainState", defaultDomainState)
}

// v19: file states persisted before the domain lens carry no fileSettings.domainWords
export function migrateCcStateRecordToV19<T>(state: T): T {
    if (!isPersistedRecord(state) || !Array.isArray(state["files"])) {
        return state
    }
    return { ...state, files: state["files"].map(fileState => withSeededFileSetting(fileState, "domainWords")) } as T
}

// v20: a sharedView persisted before metric rules carries no metricRules
export function migrateCcStateRecordToV20<T>(state: T): T {
    return seedIntoRootIfAbsent(state, "sharedView", "metricRules", { metricRules: defaultSharedView.metricRules })
}

// v21: preferences persisted before the centre-map zoom was configurable carry no centerMapZoom
export function migrateCcStateRecordToV21<T>(state: T): T {
    return seedIntoRootIfAbsent(state, "preferences", "centerMapZoom", { centerMapZoom: defaultCenterMapZoom })
}

// v24: preferences persisted before the radial layouts coloured their folders carry no folder colouring
export function migrateCcStateRecordToV24<T>(state: T): T {
    const radialFolderColoring = {
        radialFolderValue: defaultRadialFolderValue,
        radialFolderStyle: defaultRadialFolderStyle,
        radialFolderTint: defaultRadialFolderTint
    }
    return seedIntoRootIfAbsent(state, "preferences", "radialFolderValue", radialFolderColoring)
}

// v25: preferences persisted before the radial layouts let the user pick their depth carry no level count
export function migrateCcStateRecordToV25<T>(state: T): T {
    return seedIntoRootIfAbsent(state, "preferences", "radialLevels", { radialLevels: defaultRadialLevels })
}
