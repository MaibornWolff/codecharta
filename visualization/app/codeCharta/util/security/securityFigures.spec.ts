import { SecurityData } from "../../model/codeCharta.model"
import { packagesReachedByFile } from "./packageReach"
import { EXPRESS, LODASH, QS, shopSecurity } from "./security.mocks"
import { SECURITY_METRICS, securityFiguresByPath } from "./securityFigures"

describe("securityFiguresByPath", () => {
    it("should give a lockfile the figures of every package it declares", () => {
        // Arrange
        const security = shopSecurity()

        // Act
        const figures = securityFiguresByPath(security)["/root/package-lock.json"]

        // Assert
        expect(figures).toEqual({
            [SECURITY_METRICS.packages]: 4,
            [SECURITY_METRICS.vulnerablePackages]: 1,
            [SECURITY_METRICS.worstSeverity]: 3,
            [SECURITY_METRICS.meanDaysOutdated]: 575,
            [SECURITY_METRICS.outdatedPackages]: 2
        })
    })

    it("should give a code file the figures of the packages it imports and everything they pull in", () => {
        // Arrange
        const security = shopSecurity()

        // Act
        const figures = securityFiguresByPath(security)["/root/src/server/routes.ts"]

        // Assert
        expect(figures[SECURITY_METRICS.packages]).toBe(2)
        expect(figures[SECURITY_METRICS.vulnerablePackages]).toBe(1)
        expect(figures[SECURITY_METRICS.meanDaysOutdated]).toBe(1150)
    })

    it("should leave out the vulnerability figures when nobody checked the packages", () => {
        // Arrange
        const security = shopSecurity({ vulnerabilitiesMeasured: false })

        // Act
        const figures = securityFiguresByPath(security)["/root/package-lock.json"]

        // Assert
        expect(figures).not.toHaveProperty(SECURITY_METRICS.vulnerablePackages)
        expect(figures).not.toHaveProperty(SECURITY_METRICS.worstSeverity)
    })

    it("should leave out the lag figures when no version was looked up", () => {
        // Arrange
        const security = shopSecurity()
        for (const securityPackage of Object.values(security.packages)) {
            delete securityPackage.daysOutdated
        }

        // Act
        const figures = securityFiguresByPath(security)["/root/package-lock.json"]

        // Assert
        expect(figures).not.toHaveProperty(SECURITY_METRICS.meanDaysOutdated)
        expect(figures).not.toHaveProperty(SECURITY_METRICS.outdatedPackages)
    })
})

describe("packagesReachedByFile", () => {
    it("should follow each import through the packages it depends on", () => {
        // Arrange
        const security = shopSecurity()

        // Act
        const reached = packagesReachedByFile(security)

        // Assert
        expect([...reached["/root/src/app.ts"]].sort()).toEqual([EXPRESS, LODASH, QS].sort())
    })

    it("should take a package from the lockfile nearest to the file", () => {
        // Arrange
        const older = "pkg:npm/lodash@3.10.1"
        const security: SecurityData = {
            ...shopSecurity(),
            packages: { ...shopSecurity().packages, [older]: { name: "lodash", version: "3.10.1", ecosystem: "npm" } },
            lockfiles: {
                "/root/package-lock.json": { declares: [LODASH], dependsOn: [LODASH] },
                "/root/legacy/package-lock.json": { declares: [older], dependsOn: [older] }
            },
            externalImports: { "/root/legacy/old.js": [{ ecosystem: "npm", name: "lodash" }] }
        }

        // Act
        const reached = packagesReachedByFile(security)

        // Assert
        expect([...reached["/root/legacy/old.js"]]).toEqual([older])
    })

    it("should match a Go import to the module it lies in, and Python and Rust names however they are written", () => {
        // Arrange
        const security: SecurityData = {
            ...shopSecurity({ lockfiles: {} }),
            packages: {
                "pkg:golang/github.com/google/uuid@v1.6.0": { name: "github.com/google/uuid", version: "v1.6.0", ecosystem: "golang" },
                "pkg:pypi/pyyaml@6.0.1": { name: "pyyaml", version: "6.0.1", ecosystem: "pypi" },
                "pkg:cargo/serde-json@1.0.0": { name: "serde-json", version: "1.0.0", ecosystem: "cargo" }
            },
            externalImports: {
                "/root/main.go": [{ ecosystem: "golang", name: "github.com/google/uuid/internal" }],
                "/root/load.py": [{ ecosystem: "pypi", name: "PyYAML" }],
                "/root/main.rs": [{ ecosystem: "cargo", name: "serde_json" }]
            }
        }

        // Act
        const reached = packagesReachedByFile(security)

        // Assert
        expect([...reached["/root/main.go"]]).toEqual(["pkg:golang/github.com/google/uuid@v1.6.0"])
        expect([...reached["/root/load.py"]]).toEqual(["pkg:pypi/pyyaml@6.0.1"])
        expect([...reached["/root/main.rs"]]).toEqual(["pkg:cargo/serde-json@1.0.0"])
    })

    it("should leave out a file whose imports name no known package", () => {
        // Arrange
        const security = shopSecurity({ externalImports: { "/root/src/unknown.ts": [{ ecosystem: "npm", name: "left-out" }] } })

        // Act
        const reached = packagesReachedByFile(security)

        // Assert
        expect(reached).toEqual({})
    })
})
