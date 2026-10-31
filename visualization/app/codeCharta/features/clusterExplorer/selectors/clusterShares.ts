import { notAttributedShareOf, repositoryMarkersOf } from "../../../lenses/clusters/clusters.facade"
import { ClusterData, ClusteringData } from "../../../model/codeCharta.model"

export interface ClusterShareRow {
    id: string
    name: string
    repositoryMarker: string | null
    share: number
    filePaths: string[]
}

export interface ClusterShares {
    rows: ClusterShareRow[]
    /** Null where weights are not summed across clusters, so no remainder exists. */
    notAttributedShare: number | null
}

/** Every shown file counts the same: a cluster's share is the sum of its file weights over the number of shown files. */
export function clusterSharesOf(clustering: ClusteringData, shownFilePaths: ReadonlySet<string>): ClusterShares {
    const markers = repositoryMarkersOf(clustering)
    const rows = clustering.clusters
        .map(cluster => rowOf(cluster, shownFilePaths, markers.get(cluster.id) ?? null))
        .filter(row => row.filePaths.length > 0)
        .sort((first, second) => second.share - first.share)
    return { rows, notAttributedShare: remainderOf(clustering, rows, shownFilePaths) }
}

function rowOf(cluster: ClusterData, shownFilePaths: ReadonlySet<string>, repositoryMarker: string | null): ClusterShareRow {
    const filePaths: string[] = []
    let weightSum = 0
    for (const [path, weight] of Object.entries(cluster.members)) {
        if (shownFilePaths.has(path)) {
            filePaths.push(path)
            weightSum += weight
        }
    }
    return { id: cluster.id, name: cluster.name, repositoryMarker, share: weightSum / Math.max(shownFilePaths.size, 1), filePaths }
}

function remainderOf(clustering: ClusteringData, rows: ClusterShareRow[], shownFilePaths: ReadonlySet<string>): number | null {
    if (clustering.membership === "overlay" || shownFilePaths.size === 0) {
        return null
    }
    return notAttributedShareOf(rows.reduce((sum, row) => sum + row.share, 0))
}
