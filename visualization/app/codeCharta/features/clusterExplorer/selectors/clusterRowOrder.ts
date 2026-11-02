import { ClusteringData } from "../../../model/codeCharta.model"
import { ClusterShareRow } from "./clusterShares"

export const BY_SHARE = ""

export interface ClusterSortOption {
    key: string
    title: string
}

const SHARE_OPTION: ClusterSortOption = { key: BY_SHARE, title: "Share of files" }

export function sortOptionsOf(clustering: ClusteringData | undefined): ClusterSortOption[] {
    const attributeOptions = Object.entries(clustering?.attributeTitles ?? {}).map(([key, title]) => ({ key, title }))
    return [SHARE_OPTION, ...attributeOptions]
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

/** The sorted value leads, as the line is cut off in a narrow panel. */
export function attributeSummaryOf(row: ClusterShareRow, attributeTitles: Record<string, string> = {}, sortKey = BY_SHARE): string {
    return Object.entries(attributeTitles)
        .filter(([key]) => row.attributes[key] !== undefined)
        .sort(([first], [second]) => Number(second === sortKey) - Number(first === sortKey))
        .map(([key, title]) => `${title}: ${row.attributes[key]}`)
        .join(" · ")
}
