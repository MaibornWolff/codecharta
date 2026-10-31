import { createSelector } from "@ngrx/store"
import { CCFile, ClusterData, ClusteringData, ClusteringsData } from "../../../model/codeCharta.model"
import { getCCFiles, isDeltaState, isPartialState } from "../../../model/files/files.helper"
import { visibleFileStatesSelector } from "../../../stores/fileStore/fileStore.facade"
import { getUpdatedPath } from "../../../util/nodePathHelper"

const NO_CLUSTERINGS: ClusteringsData = {}

// Compare mode draws differences between two maps, which a share of either one does not describe.
export const clusteringsSelector = createSelector(visibleFileStatesSelector, fileStates =>
    isDeltaState(fileStates) ? NO_CLUSTERINGS : mergeClusterings(getCCFiles(fileStates), isPartialState(fileStates))
)

export const hasClusteringsSelector = createSelector(clusteringsSelector, clusterings =>
    Object.values(clusterings).some(clustering => clustering.clusters.length > 0)
)

function mergeClusterings(files: CCFile[], withFileNamePrefix: boolean): ClusteringsData {
    if (files.length === 1) {
        return files[0].settings.fileSettings.clusterings ?? NO_CLUSTERINGS
    }
    const merged: ClusteringsData = {}
    for (const file of files) {
        for (const [key, clustering] of Object.entries(file.settings.fileSettings.clusterings ?? {})) {
            const located = withFileNamePrefix ? underFileName(clustering, file.fileMeta.fileName) : clustering
            merged[key] = merged[key] ? mergeClustering(merged[key], located) : located
        }
    }
    return merged
}

function underFileName(clustering: ClusteringData, fileName: string): ClusteringData {
    return {
        ...clustering,
        clusters: clustering.clusters.map(cluster => ({
            ...cluster,
            members: Object.fromEntries(Object.entries(cluster.members).map(([path, weight]) => [getUpdatedPath(fileName, path), weight]))
        }))
    }
}

function mergeClustering(first: ClusteringData, second: ClusteringData): ClusteringData {
    const clusterById = new Map<string, ClusterData>(first.clusters.map(cluster => [cluster.id, cluster]))
    for (const cluster of second.clusters) {
        const existing = clusterById.get(cluster.id)
        clusterById.set(cluster.id, existing ? { ...existing, members: { ...cluster.members, ...existing.members } } : cluster)
    }
    return { ...first, clusters: [...clusterById.values()] }
}
