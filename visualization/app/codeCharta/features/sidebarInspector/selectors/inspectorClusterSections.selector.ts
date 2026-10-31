import { createSelector } from "@ngrx/store"
import { clusteringsSelector, notAttributedShareOf, repositoryMarkersOf } from "../../../lenses/clusters/clusters.facade"
import { ClusteringsData, CodeMapNode } from "../../../model/codeCharta.model"
import { selectedNodeSelector } from "../../../renderer/renderModel/renderModel.facade"
import { isLeaf } from "../../../util/codeMapHelper"

interface InspectorClusterOwner {
    id: string
    name: string
    repositoryMarker: string | null
    share: number
}

export interface InspectorClusterSection {
    key: string
    title: string
    owners: InspectorClusterOwner[]
    notAttributedShare: number | null
}

const NO_SECTIONS: InspectorClusterSection[] = []

export const _inspectorClusterSections = (node: CodeMapNode | undefined, clusterings: ClusteringsData): InspectorClusterSection[] => {
    if (!node || !isLeaf(node)) {
        return NO_SECTIONS
    }
    return Object.entries(clusterings)
        .map(([key, clustering]): InspectorClusterSection => {
            const markers = repositoryMarkersOf(clustering)
            const owners = clustering.clusters
                .filter(cluster => node.path in cluster.members)
                .map(cluster => ({
                    id: cluster.id,
                    name: cluster.name,
                    repositoryMarker: markers.get(cluster.id) ?? null,
                    share: cluster.members[node.path]
                }))
                .sort((first, second) => second.share - first.share)
            const attributedShare = owners.reduce((sum, owner) => sum + owner.share, 0)
            return {
                key,
                title: clustering.title,
                owners,
                notAttributedShare: clustering.membership === "overlay" ? null : notAttributedShareOf(attributedShare)
            }
        })
        .sort((first, second) => first.title.localeCompare(second.title))
}

export const inspectorClusterSectionsSelector = createSelector(selectedNodeSelector, clusteringsSelector, _inspectorClusterSections)
