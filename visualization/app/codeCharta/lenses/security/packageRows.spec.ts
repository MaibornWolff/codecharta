import { EXPRESS, LEFT_PAD, QS, shopSecurity } from "../../util/security/security.mocks"
import { packageRowsOf } from "./packageRows"

describe("packageRowsOf", () => {
    it("should list the vulnerable package first and then the longest outdated", () => {
        // Arrange
        const security = shopSecurity()

        // Act
        const rows = packageRowsOf(security)

        // Assert
        expect(rows.map(row => row.key)).toEqual([QS, EXPRESS, LEFT_PAD, "pkg:npm/lodash@4.17.21"])
    })

    it("should say which lockfiles declare a package and which files reach it", () => {
        // Arrange
        const security = shopSecurity()

        // Act
        const qs = packageRowsOf(security).find(row => row.key === QS)

        // Assert
        expect(qs.lockfiles).toEqual(["/root/package-lock.json"])
        expect(qs.importingFiles.sort()).toEqual(["/root/src/app.ts", "/root/src/server/routes.ts"])
        expect(qs.isDirect).toBe(false)
        expect(qs.worstSeverity).toBe("high")
    })

    it("should mark every package as not checked when no scanner checked them", () => {
        // Arrange
        const security = shopSecurity({ vulnerabilitiesMeasured: false })

        // Act
        const rows = packageRowsOf(security)

        // Assert
        expect(rows.every(row => row.isUnchecked)).toBe(true)
    })
})
