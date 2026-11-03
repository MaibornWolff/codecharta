import { ClusterShareRow } from "./clusterShares"

export const OFF_MAP_GROUP_ID = "off-map-group"

interface ClusterEntry {
    kind: "cluster"
    id: string
    row: ClusterShareRow
    isInGroup: boolean
}

interface OffMapGroupEntry {
    kind: "offMapGroup"
    id: typeof OFF_MAP_GROUP_ID
    clusterCount: number
    /** Null where shares overlap, so their sum would mean nothing. */
    share: number | null
    isOpen: boolean
}

export type ClusterListEntry = ClusterEntry | OffMapGroupEntry

export interface OffMapGrouping {
    isOffMap: (row: ClusterShareRow) => boolean
    isOpen: boolean
    sharesAddUp: boolean
}

export function clusterListEntriesOf(rows: ClusterShareRow[], grouping: OffMapGrouping): ClusterListEntry[] {
    const onMap = rows.filter(row => !grouping.isOffMap(row)).map(row => clusterEntryOf(row, false))
    const offMap = rows.filter(row => grouping.isOffMap(row))
    if (offMap.length === 0) {
        return onMap
    }
    const group: OffMapGroupEntry = {
        kind: "offMapGroup",
        id: OFF_MAP_GROUP_ID,
        clusterCount: offMap.length,
        share: grouping.sharesAddUp ? offMap.reduce((sum, row) => sum + row.share, 0) : null,
        isOpen: grouping.isOpen
    }
    return [...onMap, group, ...(grouping.isOpen ? offMap.map(row => clusterEntryOf(row, true)) : [])]
}

function clusterEntryOf(row: ClusterShareRow, isInGroup: boolean): ClusterEntry {
    return { kind: "cluster", id: row.id, row, isInGroup }
}
