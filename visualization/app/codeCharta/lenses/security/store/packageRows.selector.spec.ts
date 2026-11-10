import { shopSecurity } from "../../../util/security/security.mocks"
import { packageRowsSelector, securitySummarySelector } from "./packageRows.selector"

describe("packageRowsSelector", () => {
    it("should list no rows and no summary without security data", () => {
        // Arrange & Act
        const rows = packageRowsSelector.projector(undefined)
        const summary = securitySummarySelector.projector(undefined)

        // Assert
        expect(rows).toEqual([])
        expect(summary).toBeNull()
    })

    it("should list a row per package and sum them up", () => {
        // Arrange
        const security = shopSecurity()

        // Act
        const rows = packageRowsSelector.projector(security)
        const summary = securitySummarySelector.projector(security)

        // Assert
        expect(rows).toHaveLength(4)
        expect(summary.packages).toBe(4)
    })
})
