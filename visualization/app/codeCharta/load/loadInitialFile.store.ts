import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { dequal } from "dequal"
import {
    DependencyLensSource,
    DomainLensSource,
    DomainState,
    MapState,
    MetricsLensSource,
    Preferences,
    SharedView
} from "../model/codeCharta.model"
import { FileState } from "../model/files/files"
import { getCCFiles } from "../model/files/files.helper"
import { DependencyLensSourceReadWindow } from "../stores/dependencyLensSource/dependencyLensSource.read.facade"
import { DomainLensSourceReadWindow } from "../stores/domainLensSource/domainLensSource.read.facade"
import { DomainStateReadWindow } from "../stores/domainState/domainState.read.facade"
import { FileStoreReadWindow, setCurrentFilesAreSampleFiles, setDelta, setFiles } from "../stores/fileStore/fileStore.facade"
import { MapStateReadWindow } from "../stores/mapState/mapState.read.facade"
import { MetricsLensSourceReadWindow } from "../stores/metricsLensSource/metricsLensSource.read.facade"
import { PreferencesReadWindow } from "../stores/preferences/preferences.read.facade"
import { SharedViewReadWindow } from "../stores/sharedView/sharedView.read.facade"
import {
    dependencyLensSourceActions,
    domainLensSourceActions,
    domainStateActions,
    ignoredSharedViewKeys,
    mapStateActions,
    metricsLensSourceActions,
    preferencesActions,
    SettingActionCreators,
    sharedViewActions
} from "./loadInitialFile.actionsBySettingKey"

@Injectable({ providedIn: "root" })
export class LoadInitialFileStore {
    private static readonly noOptionalKeys: ReadonlySet<string> = new Set()

    private static readonly optionalMapStateKeys = new Set(["labelMode", "groupLabelCollisions", "labelSize", "labelsPerMap"])

    private static readonly optionalDomainStateKeys = new Set(["sortingOrder", "sortingOrderAscending", "searchPattern", "hiddenWords"])

    // The merged word bank is derived and deliberately not persisted, so a blob without it is complete.
    private static readonly optionalDomainLensSourceKeys = new Set(["words"])

    private static readonly ignoredSharedViewKeys: ReadonlySet<string> = new Set(ignoredSharedViewKeys)

    constructor(
        private readonly store: Store,
        private readonly preferencesReadWindow: PreferencesReadWindow,
        private readonly metricsLensSourceReadWindow: MetricsLensSourceReadWindow,
        private readonly dependencyLensSourceReadWindow: DependencyLensSourceReadWindow,
        private readonly domainLensSourceReadWindow: DomainLensSourceReadWindow,
        private readonly domainStateReadWindow: DomainStateReadWindow,
        private readonly sharedViewReadWindow: SharedViewReadWindow,
        private readonly mapStateReadWindow: MapStateReadWindow,
        private readonly fileStoreReadWindow: FileStoreReadWindow
    ) {}

    setFiles(value: FileState[]) {
        this.store.dispatch(setFiles({ value }))
    }

    setCurrentFilesAreSampleFiles(value: boolean) {
        this.store.dispatch(setCurrentFilesAreSampleFiles({ value }))
    }

    applyPreferences(savedPreferences: Preferences) {
        return this.applySlice(this.preferencesReadWindow.getPreferences(), savedPreferences, (key, value) =>
            this.dispatchSetting(preferencesActions, key, value)
        )
    }

    applyMetricsLensSource(savedMetricsLensSource: MetricsLensSource) {
        return this.applySlice(this.metricsLensSourceReadWindow.getMetricsLensSource(), savedMetricsLensSource, (key, value) =>
            this.dispatchSetting(metricsLensSourceActions, key, value)
        )
    }

    applyDependencyLensSource(savedDependencyLensSource: DependencyLensSource) {
        return this.applySlice(this.dependencyLensSourceReadWindow.getDependencyLensSource(), savedDependencyLensSource, (key, value) =>
            this.dispatchSetting(dependencyLensSourceActions, key, value)
        )
    }

    applyDomainLensSource(savedDomainLensSource: DomainLensSource) {
        return this.applySlice(
            this.domainLensSourceReadWindow.getDomainLensSource(),
            savedDomainLensSource,
            (key, value) => this.dispatchSetting(domainLensSourceActions, key, value),
            LoadInitialFileStore.optionalDomainLensSourceKeys
        )
    }

    applySharedView(savedSharedView: SharedView) {
        return this.applySlice(
            this.sharedViewReadWindow.getSharedView(),
            savedSharedView,
            (key, value) => this.dispatchSharedViewSetting(key, value),
            LoadInitialFileStore.ignoredSharedViewKeys
        )
    }

    applyMapState(savedMapState: MapState) {
        return this.applySlice(
            this.mapStateReadWindow.getMapState(),
            savedMapState,
            (key, value) => this.dispatchSetting(mapStateActions, key, value),
            LoadInitialFileStore.optionalMapStateKeys
        )
    }

    applyDomainState(savedDomainState: DomainState) {
        return this.applySlice(
            this.domainStateReadWindow.getDomainState(),
            savedDomainState,
            (key, value) => this.dispatchSetting(domainStateActions, key, value),
            LoadInitialFileStore.optionalDomainStateKeys
        )
    }

    missingKeysOfSharedView(savedSharedView: SharedView): string[] {
        return this.missingKeysOf(this.sharedViewReadWindow.getSharedView(), savedSharedView, LoadInitialFileStore.ignoredSharedViewKeys)
    }

    missingKeysOfMetricsLensSource(savedMetricsLensSource: MetricsLensSource): string[] {
        return this.missingKeysOf(this.metricsLensSourceReadWindow.getMetricsLensSource(), savedMetricsLensSource)
    }

    missingKeysOfDependencyLensSource(savedDependencyLensSource: DependencyLensSource): string[] {
        return this.missingKeysOf(this.dependencyLensSourceReadWindow.getDependencyLensSource(), savedDependencyLensSource)
    }

    missingKeysOfDomainLensSource(savedDomainLensSource: DomainLensSource): string[] {
        return this.missingKeysOf(
            this.domainLensSourceReadWindow.getDomainLensSource(),
            savedDomainLensSource,
            LoadInitialFileStore.optionalDomainLensSourceKeys
        )
    }

    /** Which keys of the current slice the persisted one lacks, bar those it never carries. Dispatches nothing. */
    private missingKeysOf<Slice extends object>(
        currentSlice: Slice,
        savedSlice: Slice,
        optionalKeys: ReadonlySet<string> = LoadInitialFileStore.noOptionalKeys
    ): string[] {
        return Object.keys(currentSlice).filter(key => !(key in savedSlice) && !optionalKeys.has(key))
    }

    /**
     * Restores one persisted slice onto the current one: every key of the CURRENT slice whose persisted
     * value differs is dispatched through the slice's own mapper, and every key the persisted slice does
     * not have at all is reported back as missing, for the "could not be fully restored" dialog.
     *
     * Iterating the CURRENT slice's keys — not the persisted ones — is what makes an older persisted
     * state forward-compatible: a key added since it was written is simply left at its default.
     */
    private applySlice<Slice extends object>(
        currentSlice: Slice,
        savedSlice: Slice,
        dispatchKey: (key: keyof Slice, value: Slice[keyof Slice]) => void,
        optionalKeys: ReadonlySet<string> = LoadInitialFileStore.noOptionalKeys
    ): string[] {
        const missingKeys: string[] = []

        for (const [key, currentValue] of Object.entries(currentSlice)) {
            if (!(key in savedSlice)) {
                if (!optionalKeys.has(key)) {
                    missingKeys.push(key)
                }
                continue
            }
            const savedValue = savedSlice[key]
            if (!dequal(currentValue, savedValue)) {
                dispatchKey(key as keyof Slice, savedValue)
            }
        }

        return missingKeys
    }

    setRenderState(renderState: string) {
        const files = getCCFiles(this.fileStoreReadWindow.getFiles())
        if (renderState === "Delta" && files.length >= 2) {
            this.store.dispatch(setDelta({ referenceFile: files[0], comparisonFile: files[1] }))
        }
    }

    private dispatchSharedViewSetting(key: keyof SharedView, value: unknown) {
        if (!LoadInitialFileStore.ignoredSharedViewKeys.has(key)) {
            this.dispatchSetting(sharedViewActions, key, value)
        }
    }

    private dispatchSetting<Slice>(actionCreators: SettingActionCreators<Slice>, key: PropertyKey, value: unknown) {
        if (!Object.hasOwn(actionCreators, key)) {
            throw new Error(`Unhandled key: ${String(key)}`)
        }
        const action = actionCreators[key as keyof Slice]({ value: value as Slice[keyof Slice] })
        if (action !== undefined) {
            this.store.dispatch(action)
        }
    }
}
