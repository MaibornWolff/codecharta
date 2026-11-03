import { notAttributedShareOf, repositoryMarkersOf } from "../../../lenses/clusters/clusters.facade"
import { ClusterAttributes, ClusterData, ClusteringData } from "../../../model/codeCharta.model"
import { ShownFiles } from "./shownFiles.selector"

export interface ClusterShareRow {
    id: string
    name: string
    repositoryMarker: string | null
    share: number
    /** The part of the map's area its files cover, which a highlight lights; null where the map has no area to compare with. */
    mapShare: number | null
    filePaths: string[]
    attributes: ClusterAttributes
}

export interface ClusterShares {
    rows: ClusterShareRow[]
    /** Null where weights are not summed across clusters, so no remainder exists. */
    notAttributedShare: number | null
    shareLabel: string
    attributeTitles: Record<string, string>
}

interface ShareMeasure {
    label: string
    total: number
    sizeOf: (path: string) => number
}

interface RowMeasures {
    share: ShareMeasure
    mapArea: ShareMeasure | null
    countsWeights: boolean
}

const LINES_METRIC = "loc"
export const SHARE_OF_FILES = "share of files"
const SHARE_OF_THE_MAP = "share of the map"

/** A cluster's share is its weights times the size of their files, over the size of all shown files; an overlay's ignores the weights. */
export function clusterSharesOf(clustering: ClusteringData, shownFiles: ShownFiles, areaMetric: string | undefined): ClusterShares {
    const markers = repositoryMarkersOf(clustering)
    const measures = rowMeasuresOf(clustering, shownFiles, areaMetric)
    const rows = clustering.clusters
        .map(cluster => rowOf(cluster, shownFiles, measures, markers.get(cluster.id) ?? null))
        .filter(row => row.filePaths.length > 0)
        .sort((first, second) => second.share - first.share)
    return {
        rows,
        notAttributedShare: remainderOf(clustering, rows, shownFiles),
        shareLabel: measures.share.label,
        attributeTitles: clustering.attributeTitles ?? {}
    }
}

// An overlay's weights mean something of their own, such as a commit's churn, so its share is the map its files cover.
function rowMeasuresOf(clustering: ClusteringData, shownFiles: ShownFiles, areaMetric: string | undefined): RowMeasures {
    const mapArea = metricMeasureOf(areaMetric, shownFiles)
    if (clustering.membership === "overlay") {
        const share = mapArea ? { ...mapArea, label: SHARE_OF_THE_MAP } : fileCountMeasureOf(shownFiles)
        return { share, mapArea: null, countsWeights: false }
    }
    return { share: mapArea ?? fallbackMeasureOf(clustering, shownFiles), mapArea, countsWeights: true }
}

// Where no shown file holds the area metric that sizes the buildings. A map may not hold the metric its clustering
// names either, such as one from the git log alone; then every file counts the same.
function fallbackMeasureOf(clustering: ClusteringData, shownFiles: ShownFiles): ShareMeasure {
    return metricMeasureOf(clustering.weightBasis, shownFiles) ?? fileCountMeasureOf(shownFiles)
}

function fileCountMeasureOf(shownFiles: ShownFiles): ShareMeasure {
    return { label: SHARE_OF_FILES, total: shownFiles.size, sizeOf: () => 1 }
}

function metricMeasureOf(metric: string | undefined, shownFiles: ShownFiles): ShareMeasure | null {
    const total = metric ? [...shownFiles.values()].reduce((sum, attributes) => sum + (attributes[metric] ?? 0), 0) : 0
    if (!metric || total <= 0) {
        return null
    }
    return {
        label: metric === LINES_METRIC ? "share of lines" : `share of ${metric}`,
        total,
        sizeOf: path => shownFiles.get(path)?.[metric] ?? 0
    }
}

function rowOf(cluster: ClusterData, shownFiles: ShownFiles, measures: RowMeasures, repositoryMarker: string | null): ClusterShareRow {
    const filePaths: string[] = []
    let weightedSize = 0
    for (const [path, weight] of Object.entries(cluster.members)) {
        if (shownFiles.has(path)) {
            filePaths.push(path)
            weightedSize += (measures.countsWeights ? weight : 1) * measures.share.sizeOf(path)
        }
    }
    return {
        id: cluster.id,
        name: cluster.name,
        repositoryMarker,
        share: measures.share.total > 0 ? weightedSize / measures.share.total : 0,
        mapShare: measures.mapArea && mapShareOf(filePaths, measures.mapArea),
        filePaths,
        attributes: cluster.attributes ?? {}
    }
}

function mapShareOf(filePaths: string[], mapArea: ShareMeasure): number {
    return filePaths.reduce((sum, path) => sum + mapArea.sizeOf(path), 0) / mapArea.total
}

function remainderOf(clustering: ClusteringData, rows: ClusterShareRow[], shownFiles: ShownFiles): number | null {
    if (clustering.membership === "overlay" || shownFiles.size === 0) {
        return null
    }
    return notAttributedShareOf(rows.reduce((sum, row) => sum + row.share, 0))
}
