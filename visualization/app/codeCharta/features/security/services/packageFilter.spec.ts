import { packageRowsOf } from "../../../lenses/security/security.facade"
import { shopSecurity } from "../../../util/security/security.mocks"
import { filteredRows } from "./packageFilter"

describe("filteredRows", () => {
    const rows = packageRowsOf(shopSecurity())

    it("should keep every row without a filter", () => {
        // Arrange & Act
        const filtered = filteredRows(rows, { text: "", onlyProblems: false, scopePath: null })

        // Assert
        expect(filtered).toHaveLength(4)
    })

    it("should match the text against the name and the purl", () => {
        // Arrange & Act
        const byName = filteredRows(rows, { text: "LODASH", onlyProblems: false, scopePath: null })
        const byPurl = filteredRows(rows, { text: "@6.5", onlyProblems: false, scopePath: null })

        // Assert
        expect(byName.map(row => row.name)).toEqual(["lodash"])
        expect(byPurl.map(row => row.name)).toEqual(["qs"])
    })

    it("should keep only the packages a file or folder declares or reaches", () => {
        // Arrange & Act
        const filtered = filteredRows(rows, { text: "", onlyProblems: false, scopePath: "/root/src/app.ts" })

        // Assert
        expect(filtered.map(row => row.name).sort()).toEqual(["express", "lodash", "qs"])
    })
})
