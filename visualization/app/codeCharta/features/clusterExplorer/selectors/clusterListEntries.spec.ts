import { clusterListEntriesOf, OFF_MAP_GROUP_ID } from "./clusterListEntries"
import { ClusterShareRow } from "./clusterShares"

function row(name: string, share: number): ClusterShareRow {
    return { id: name, name, repositoryMarker: null, share, mapShare: null, filePaths: [], attributes: {} }
}

const ROWS = [row("on big", 0.5), row("off big", 0.2), row("on small", 0.1), row("off small", 0.05)]
const isOffMap = (clusterRow: ClusterShareRow) => clusterRow.name.startsWith("off")

describe("clusterListEntriesOf", () => {
    it("should list the clusters on the map in their order, then one closed group of the rest with their summed share", () => {
        // Arrange & Act
        const entries = clusterListEntriesOf(ROWS, { isOffMap, isOpen: false, sharesAddUp: true })

        // Assert
        expect(entries.map(entry => entry.id)).toEqual(["on big", "on small", OFF_MAP_GROUP_ID])
        expect(entries[2]).toEqual({ kind: "offMapGroup", id: OFF_MAP_GROUP_ID, clusterCount: 2, share: 0.25, isOpen: false })
    })

    it("should list the clusters of an open group after it, in their order", () => {
        // Arrange & Act
        const entries = clusterListEntriesOf(ROWS, { isOffMap, isOpen: true, sharesAddUp: true })

        // Assert
        expect(entries.map(entry => entry.id)).toEqual(["on big", "on small", OFF_MAP_GROUP_ID, "off big", "off small"])
        expect(entries.map(entry => entry.kind === "cluster" && entry.isInGroup)).toEqual([false, false, false, true, true])
    })

    it("should give the group no share where shares overlap", () => {
        // Arrange & Act
        const entries = clusterListEntriesOf(ROWS, { isOffMap, isOpen: false, sharesAddUp: false })

        // Assert
        expect(entries.at(-1)).toMatchObject({ kind: "offMapGroup", share: null })
    })

    it("should list no group while every cluster is on the map", () => {
        // Arrange & Act
        const entries = clusterListEntriesOf(ROWS, { isOffMap: () => false, isOpen: true, sharesAddUp: true })

        // Assert
        expect(entries.map(entry => entry.kind)).toEqual(["cluster", "cluster", "cluster", "cluster"])
    })
})
