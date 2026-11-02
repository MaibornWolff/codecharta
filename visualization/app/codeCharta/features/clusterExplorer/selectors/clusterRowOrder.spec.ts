import { ClusteringData } from "../../../model/codeCharta.model"
import { attributeSummaryOf, BY_SHARE, matchingRowsInOrder, sortOptionsOf } from "./clusterRowOrder"
import { ClusterShareRow } from "./clusterShares"

function row(name: string, attributes: ClusterShareRow["attributes"] = {}): ClusterShareRow {
    return { id: name, name, repositoryMarker: null, share: 0, filePaths: [], attributes }
}

const namesOf = (rows: ClusterShareRow[]) => rows.map(({ name }) => name)

describe("clusterRowOrder", () => {
    describe("sortOptionsOf", () => {
        it("should offer the share first, then each attribute by its title", () => {
            // Arrange
            const clustering: ClusteringData = {
                title: "Commits",
                membership: "overlay",
                clusters: [],
                attributeTitles: { date: "Date", changed_lines: "Lines changed" }
            }

            // Act
            const options = sortOptionsOf(clustering)

            // Assert
            expect(options).toEqual([
                { key: BY_SHARE, title: "Share of files" },
                { key: "date", title: "Date" },
                { key: "changed_lines", title: "Lines changed" }
            ])
        })

        it("should offer only the share without a clustering or attributes", () => {
            // Arrange & Act
            const options = sortOptionsOf(undefined)

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

    describe("attributeSummaryOf", () => {
        it("should list the values by their titles in the titles' order, leaving out what a row lacks", () => {
            // Arrange
            const titles = { date: "Date", changed_files: "Files changed", changed_lines: "Lines changed" }

            // Act
            const summary = attributeSummaryOf(row("a", { changed_lines: 3, date: "2026-01-01" }), titles)

            // Assert
            expect(summary).toBe("Date: 2026-01-01 · Lines changed: 3")
        })

        it("should lead with the value the list is sorted by", () => {
            // Arrange
            const titles = { date: "Date", changed_lines: "Lines changed" }

            // Act
            const summary = attributeSummaryOf(row("a", { changed_lines: 3, date: "2026-01-01" }), titles, "changed_lines")

            // Assert
            expect(summary).toBe("Lines changed: 3 · Date: 2026-01-01")
        })

        it("should be empty without titles", () => {
            // Arrange & Act
            const summary = attributeSummaryOf(row("a", { date: "2026-01-01" }))

            // Assert
            expect(summary).toBe("")
        })
    })
})
