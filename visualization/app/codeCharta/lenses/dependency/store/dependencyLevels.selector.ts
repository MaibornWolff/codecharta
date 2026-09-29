import { createSelector } from "@ngrx/store"
import { CCFile, DependencyLevelData, FileState } from "../../../model/codeCharta.model"
import { getCCFiles, isPartialState } from "../../../model/files/files.helper"
import { visibleFileStatesSelector, visibleFileStatesWithCurrentSettingsSelector } from "../../../stores/fileStore/fileStore.facade"
import { getUpdatedPath } from "../../../util/nodePathHelper"

export const dependencyLevelsSelector = createSelector(visibleFileStatesSelector, visibleFileStates =>
    mergeDependencyLevels(getCCFiles(visibleFileStates), isPartialState(visibleFileStates))
)

/** The files and folders that carry a level, and the folders holding them: what the dependency graph can show. */
export const pathsWithDependencyLevelsSelector = createSelector(dependencyLevelsSelector, levels => {
    const paths = new Set<string>()
    for (const path of Object.keys(levels)) {
        for (let ancestor = path; ancestor.length > 0 && !paths.has(ancestor); ancestor = ancestor.slice(0, ancestor.lastIndexOf("/"))) {
            paths.add(ancestor)
        }
    }
    return paths as ReadonlySet<string>
})

export const hasDependencyDataSelector = createSelector(dependencyLevelsSelector, levels => Object.keys(levels).length > 0)

const carriesNoDependencyLens = ({ file }: FileState) => Object.keys(file.settings.fileSettings.dependencyLevels ?? {}).length === 0

export const isLoadedFileSetWithoutDependencyLensSelector = createSelector(
    visibleFileStatesWithCurrentSettingsSelector,
    visibleFileStates => visibleFileStates.length > 0 && visibleFileStates.every(carriesNoDependencyLens)
)

function mergeDependencyLevels(files: CCFile[], withFileNamePrefix: boolean): DependencyLevelData {
    if (files.length === 1) {
        return files[0].settings.fileSettings.dependencyLevels ?? {}
    }
    const merged: DependencyLevelData = {}
    for (const file of files) {
        for (const [path, level] of Object.entries(file.settings.fileSettings.dependencyLevels ?? {})) {
            merged[withFileNamePrefix ? getUpdatedPath(file.fileMeta.fileName, path) : path] = level
        }
    }
    return merged
}
