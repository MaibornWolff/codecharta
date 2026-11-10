import { shopSecurity } from "../../util/security/security.mocks"
import { securitySummaryOf } from "./securitySummary"

describe("securitySummaryOf", () => {
    it("should count the packages, the vulnerable and the outdated ones", () => {
        // Arrange
        const security = shopSecurity()

        // Act
        const summary = securitySummaryOf(security)

        // Assert
        expect(summary).toEqual({
            packages: 4,
            vulnerablePackages: 1,
            outdatedPackages: 2,
            meanDaysOutdated: 575,
            sources: ["trivy 0.76.1"],
            lookupDate: "2026-11-09"
        })
    })

    it("should leave what was not measured empty rather than zero", () => {
        // Arrange
        const security = shopSecurity({ vulnerabilitiesMeasured: false, versionsLookup: undefined })
        for (const securityPackage of Object.values(security.packages)) {
            delete securityPackage.daysOutdated
        }

        // Act
        const summary = securitySummaryOf(security)

        // Assert
        expect(summary.vulnerablePackages).toBeNull()
        expect(summary.outdatedPackages).toBeNull()
        expect(summary.meanDaysOutdated).toBeNull()
        expect(summary.lookupDate).toBeNull()
    })
})
