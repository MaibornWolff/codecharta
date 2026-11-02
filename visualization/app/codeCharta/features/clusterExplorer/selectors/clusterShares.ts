import { notAttributedShareOf, repositoryMarkersOf } from "../../../lenses/clusters/clusters.facade"
import { ClusterAttributes, ClusterData, ClusteringData } from "../../../model/codeCharta.model"
import { ShownFiles } from "./shownFiles.selector"

export interface ClusterShareRow {
    id: string
    name: string
    repositoryMarker: string | null
    share: number
    filePaths: string[]
    attributes: ClusterAttributes
}

export interface ClusterShares {
    rows: ClusterShareRow[]
    /** Null where weights are not summed across clusters, so no remainder exists. */
    notAttributedShare: number | null
    shareLabel: string
}

interface ShareMeasure {
    label: string
    total: number
    sizeOf: (path: string) => number
}

const LINES_METRIC = "loc"
export const SHARE_OF_FILES = "share of files"

/** A cluster's share is its weights times the size of their files, over the size of all shown files. */
export function clusterSharesOf(clustering: ClusteringData, shownFiles: ShownFiles): ClusterShares {
    const markers = repositoryMarkersOf(clustering)
    const measure = shareMeasureOf(clustering, shownFiles)
    const rows = clustering.clusters
        .map(cluster => rowOf(cluster, shownFiles, measure, markers.get(cluster.id) ?? null))
        .filter(row => row.filePaths.length > 0)
        .sort((first, second) => second.share - first.share)
    return { rows, notAttributedShare: remainderOf(clustering, rows, shownFiles), shareLabel: measure.label }
}

// A map may not hold the metric its clustering names, such as one from the git log alone; then every file counts the same.
function shareMeasureOf(clustering: ClusteringData, shownFiles: ShownFiles): ShareMeasure {
    const metric = clustering.weightBasis
    const metricTotal = metric ? [...shownFiles.values()].reduce((sum, attributes) => sum + (attributes[metric] ?? 0), 0) : 0
    if (!metric || metricTotal <= 0) {
        return { label: SHARE_OF_FILES, total: shownFiles.size, sizeOf: () => 1 }
    }
    return {
        label: metric === LINES_METRIC ? "share of lines" : `share of ${metric}`,
        total: metricTotal,
        sizeOf: path => shownFiles.get(path)?.[metric] ?? 0
    }
}

function rowOf(cluster: ClusterData, shownFiles: ShownFiles, measure: ShareMeasure, repositoryMarker: string | null): ClusterShareRow {
    const filePaths: string[] = []
    let weightedSize = 0
    for (const [path, weight] of Object.entries(cluster.members)) {
        if (shownFiles.has(path)) {
            filePaths.push(path)
            weightedSize += weight * measure.sizeOf(path)
        }
    }
    return {
        id: cluster.id,
        name: cluster.name,
        repositoryMarker,
        share: measure.total > 0 ? weightedSize / measure.total : 0,
        filePaths,
        attributes: cluster.attributes ?? {}
    }
}

function remainderOf(clustering: ClusteringData, rows: ClusterShareRow[], shownFiles: ShownFiles): number | null {
    if (clustering.membership === "overlay" || shownFiles.size === 0) {
        return null
    }
    return notAttributedShareOf(rows.reduce((sum, row) => sum + row.share, 0))
}
