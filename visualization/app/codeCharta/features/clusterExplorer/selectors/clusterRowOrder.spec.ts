import { BY_SHARE, detailLineOf, matchingRowsInOrder, sortOptionsOf } from "./clusterRowOrder"
import { ClusterShareRow } from "./clusterShares"

function row(name: string, attributes: ClusterShareRow["attributes"] = {}, mapShare: number | null = null): ClusterShareRow {
    return { id: name, name, repositoryMarker: null, share: 0, mapShare, filePaths: [], path: null, attributes }
}

const namesOf = (rows: ClusterShareRow[]) => rows.map(({ name }) => name)

describe("clusterRowOrder", () => {
    describe("sortOptionsOf", () => {
        it("should offer the share first, then each attribute by its title", () => {
            // Arrange
            const attributeTitles = { date: "Date", changed_lines: "Lines changed" }

            // Act
            const options = sortOptionsOf("share of lines", attributeTitles)

            // Assert
            expect(options).toEqual([
                { key: BY_SHARE, title: "Share of lines" },
                { key: "date", title: "Date" },
                { key: "changed_lines", title: "Lines changed" }
            ])
        })

        it("should offer only the share without attributes", () => {
            // Arrange & Act
            const options = sortOptionsOf("share of files", {})

            // Assert
            expect(options.map(({ key }) => key)).toEqual([BY_SHARE])
        })
    })

    describe("matchingRowsInOrder", () => {
        it("should keep the order it was given when sorting by share", () => {
            // Arrange
            const rows = [row("big"), row("small")]

            // Act
            const arranged = matchingRowsInOrder(rows, "", BY_SHARE)

            // Assert
            expect(arranged).toBe(rows)
        })

        it("should match a name in any case, ignoring spaces around the text", () => {
            // Arrange
            const rows = [row("a1b2 Fix LOGIN"), row("c3d4 Add menu")]

            // Act
            const arranged = matchingRowsInOrder(rows, " login ", BY_SHARE)

            // Assert
            expect(namesOf(arranged)).toEqual(["a1b2 Fix LOGIN"])
        })

        it("should sort numbers from the highest, without changing the rows it was given", () => {
            // Arrange
            const rows = [row("nine", { lines: 9 }), row("hundred", { lines: 100 })]

            // Act
            const arranged = matchingRowsInOrder(rows, "", "lines")

            // Assert
            expect(namesOf(arranged)).toEqual(["hundred", "nine"])
            expect(namesOf(rows)).toEqual(["nine", "hundred"])
        })

        it("should sort ISO dates from the newest", () => {
            // Arrange
            const rows = [row("old", { date: "2025-12-31" }), row("new", { date: "2026-01-01" })]

            // Act
            const arranged = matchingRowsInOrder(rows, "", "date")

            // Assert
            expect(namesOf(arranged)).toEqual(["new", "old"])
        })

        it("should put rows without the attribute last, and keep them in order among themselves", () => {
            // Arrange
            const rows = [row("none first"), row("valued", { lines: 1 }), row("none second")]

            // Act
            const arranged = matchingRowsInOrder(rows, "", "lines")

            // Assert
            expect(namesOf(arranged)).toEqual(["valued", "none first", "none second"])
        })
    })

    describe("detailLineOf", () => {
        it("should list the values by their titles in the titles' order, leaving out what a row lacks", () => {
            // Arrange
            const titles = { date: "Date", changed_files: "Files changed", changed_lines: "Lines changed" }

            // Act
            const summary = detailLineOf(row("a", { changed_lines: 3, date: "2026-01-01" }), titles)

            // Assert
            expect(summary).toBe("Date: 2026-01-01 · Lines changed: 3")
        })

        it("should lead with the value the list is sorted by", () => {
            // Arrange
            const titles = { date: "Date", changed_lines: "Lines changed" }

            // Act
            const summary = detailLineOf(row("a", { changed_lines: 3, date: "2026-01-01" }), titles, "changed_lines")

            // Assert
            expect(summary).toBe("Lines changed: 3 · Date: 2026-01-01")
        })

        it("should lead with the part of the map the cluster's files cover", () => {
            // Arrange
            const titles = { date: "Date" }

            // Act
            const summary = detailLineOf(row("a", { date: "2026-01-01" }, 0.4), titles)

            // Assert
            expect(summary).toBe("in 40% of the map · Date: 2026-01-01")
        })

        it("should put the part of the map right after the value the list is sorted by", () => {
            // Arrange
            const titles = { date: "Date", changed_lines: "Lines changed" }

            // Act
            const summary = detailLineOf(row("a", { changed_lines: 3, date: "2026-01-01" }, 0.4), titles, "changed_lines")

            // Assert
            expect(summary).toBe("Lines changed: 3 · in 40% of the map · Date: 2026-01-01")
        })

        it("should lead with the part of the map when the row lacks the value the list is sorted by", () => {
            // Arrange
            const titles = { date: "Date", changed_lines: "Lines changed" }

            // Act
            const summary = detailLineOf(row("a", { date: "2026-01-01" }, 0.4), titles, "changed_lines")

            // Assert
            expect(summary).toBe("in 40% of the map · Date: 2026-01-01")
        })

        it("should leave out the part of the map for a cluster that covers none of it", () => {
            // Arrange & Act
            const summary = detailLineOf(row("a", {}, 0))

            // Assert
            expect(summary).toBe("")
        })

        it("should be empty without titles", () => {
            // Arrange & Act
            const summary = detailLineOf(row("a", { date: "2026-01-01" }))

            // Assert
            expect(summary).toBe("")
        })
    })
})
