import { EXPRESS, QS, shopSecurity } from "../../util/security/security.mocks"
import { mergedSecurity, securityUnderFileName } from "./securityData"

describe("securityUnderFileName", () => {
    it("should move the lockfiles and importing files under the folder of the map", () => {
        // Arrange
        const security = shopSecurity()

        // Act
        const moved = securityUnderFileName(security, "shop.cc.json")

        // Assert
        expect(Object.keys(moved.lockfiles)).toEqual(["/root/shop.cc.json/package-lock.json"])
        expect(Object.keys(moved.externalImports)).toContain("/root/shop.cc.json/src/app.ts")
        expect(moved.packages).toBe(security.packages)
    })
})

describe("mergedSecurity", () => {
    it("should keep a single map's data as it is", () => {
        // Arrange
        const security = shopSecurity()

        // Act
        const merged = mergedSecurity([security])

        // Assert
        expect(merged).toBe(security)
    })

    it("should mark the packages of an unchecked map as not checked when another map was checked", () => {
        // Arrange
        const checked = shopSecurity({ lockfiles: { "/root/a/package-lock.json": { declares: [QS], dependsOn: [QS] } } })
        const unchecked = shopSecurity({
            vulnerabilitiesMeasured: false,
            vulnerabilitySources: [],
            packages: { [EXPRESS]: { name: "express" } }
        })

        // Act
        const merged = mergedSecurity([unchecked, checked])

        // Assert
        expect(merged.vulnerabilitiesMeasured).toBe(true)
        expect(merged.packages[QS].vulnerabilities).toHaveLength(1)
        expect(merged.packages[EXPRESS].vulnerabilitiesUnknown).toBeUndefined()
        expect(Object.keys(merged.lockfiles)).toContain("/root/a/package-lock.json")
    })

    it("should keep the later version lookup and every vulnerability once", () => {
        // Arrange
        const first = shopSecurity({ versionsLookup: { source: "deps.dev", date: "2026-11-01" } })
        const second = shopSecurity({ versionsLookup: { source: "deps.dev", date: "2026-11-09" } })

        // Act
        const merged = mergedSecurity([first, second])

        // Assert
        expect(merged.versionsLookup.date).toBe("2026-11-09")
        expect(merged.packages[QS].vulnerabilities).toHaveLength(1)
    })
})
