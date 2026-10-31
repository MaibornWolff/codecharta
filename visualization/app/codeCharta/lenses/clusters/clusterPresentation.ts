import { ClusteringData } from "../../model/codeCharta.model"

const REPOSITORY_MARKER_OF_CLUSTER_ID = /^([0-9a-f]+)-author-\d+$/

/** The marker of each cluster's repository, by cluster id, and empty unless two repositories meet in this clustering. */
export function repositoryMarkersOf(clustering: ClusteringData): ReadonlyMap<string, string> {
    const markers = new Map<string, string>()
    for (const { id } of clustering.clusters) {
        const marker = REPOSITORY_MARKER_OF_CLUSTER_ID.exec(id)?.[1]
        if (marker !== undefined) {
            markers.set(id, marker)
        }
    }
    return new Set(markers.values()).size > 1 ? markers : new Map()
}

// Summing weights in floating point can leave a remainder far below anything a share can show
const FULLY_ATTRIBUTED_TOLERANCE = 1e-9

export function notAttributedShareOf(attributedShare: number): number {
    const remainder = 1 - attributedShare
    return remainder > FULLY_ATTRIBUTED_TOLERANCE ? remainder : 0
}

export function formatClusterShare(share: number): string {
    if (share > 0 && share < 0.01) {
        return "<1%"
    }
    return `${Math.round(share * 100)}%`
}
