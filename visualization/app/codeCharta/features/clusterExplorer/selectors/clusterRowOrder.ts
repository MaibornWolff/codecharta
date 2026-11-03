import { formatClusterShare } from "../../../lenses/clusters/clusters.facade"
import { ClusterShareRow } from "./clusterShares"

export const BY_SHARE = ""

export interface ClusterSortOption {
    key: string
    title: string
}

export function sortOptionsOf(shareLabel: string, attributeTitles: Record<string, string>): ClusterSortOption[] {
    const shareOption = { key: BY_SHARE, title: shareLabel.charAt(0).toUpperCase() + shareLabel.slice(1) }
    return [shareOption, ...Object.entries(attributeTitles).map(([key, title]) => ({ key, title }))]
}

/** [rows] arrive by share, so sorting by share has nothing to do; a sort that ties keeps that order. */
export function matchingRowsInOrder(rows: ClusterShareRow[], filterText: string, sortKey: string): ClusterShareRow[] {
    const needle = filterText.trim().toLowerCase()
    const matching = needle === "" ? rows : rows.filter(row => row.name.toLowerCase().includes(needle))
    return sortKey === BY_SHARE ? matching : [...matching].sort((first, second) => compareHighestFirst(first, second, sortKey))
}

function compareHighestFirst(first: ClusterShareRow, second: ClusterShareRow, attribute: string): number {
    const firstValue = first.attributes[attribute]
    const secondValue = second.attributes[attribute]
    if (firstValue === undefined || secondValue === undefined) {
        return Number(firstValue === undefined) - Number(secondValue === undefined)
    }
    if (typeof firstValue === "number" && typeof secondValue === "number") {
        return secondValue - firstValue
    }
    return String(secondValue).localeCompare(String(firstValue))
}

/** The sorted value leads, as the line is cut off in a narrow panel, followed by the part of the map the row lights. */
export function detailLineOf(row: ClusterShareRow, attributeTitles: Record<string, string> = {}, sortKey = BY_SHARE): string {
    const attributes = attributePartsOf(row, attributeTitles, sortKey)
    const sortedValueCount = sortKey in attributeTitles && row.attributes[sortKey] !== undefined ? 1 : 0
    // A cluster covering none of the map sits in the group of clusters not on the map, which says so already
    const mapPart = row.mapShare ? [`in ${formatClusterShare(row.mapShare)} of the map`] : []
    return [...attributes.slice(0, sortedValueCount), ...mapPart, ...attributes.slice(sortedValueCount)].join(" · ")
}

function attributePartsOf(row: ClusterShareRow, attributeTitles: Record<string, string>, sortKey: string): string[] {
    return Object.entries(attributeTitles)
        .filter(([key]) => row.attributes[key] !== undefined)
        .sort(([first], [second]) => Number(second === sortKey) - Number(first === sortKey))
        .map(([key, title]) => `${title}: ${row.attributes[key]}`)
}
