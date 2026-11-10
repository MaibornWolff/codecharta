import { SecurityData, SecurityPackage } from "../../model/codeCharta.model"

export const EXPRESS = "pkg:npm/express@4.17.1"
export const QS = "pkg:npm/qs@6.5.2"
export const LODASH = "pkg:npm/lodash@4.17.21"
export const LEFT_PAD = "pkg:npm/left-pad@1.3.0"

function npm(name: string, version: string, details: Partial<SecurityPackage> = {}): SecurityPackage {
    return { name, version, ecosystem: "npm", ...details }
}

/** A lockfile at the root with four packages, express pulling in the vulnerable qs, and two code files importing. */
export function shopSecurity(overrides: Partial<SecurityData> = {}): SecurityData {
    return {
        vulnerabilitiesMeasured: true,
        vulnerabilitySources: ["trivy 0.76.1"],
        versionsLookup: { source: "deps.dev", date: "2026-11-09" },
        packages: {
            [EXPRESS]: npm("express", "4.17.1", {
                dependsOn: [QS],
                newestVersion: "5.1.0",
                newerVersions: 9,
                daysOutdated: 900,
                libyears: 3.2
            }),
            [LEFT_PAD]: npm("left-pad", "1.3.0", { newestVersion: "1.3.0", newerVersions: 0, daysOutdated: 0, libyears: 0 }),
            [LODASH]: npm("lodash", "4.17.21", { newestVersion: "4.17.21", newerVersions: 0, daysOutdated: 0, libyears: 0 }),
            [QS]: npm("qs", "6.5.2", {
                newestVersion: "6.13.0",
                newerVersions: 12,
                daysOutdated: 1400,
                libyears: 4.5,
                vulnerabilities: [{ id: "CVE-2022-24999", severity: "high", score: 7.5, fixedVersions: ["6.5.3"] }]
            })
        },
        lockfiles: { "/root/package-lock.json": { declares: [EXPRESS, LEFT_PAD, LODASH, QS], dependsOn: [EXPRESS, LEFT_PAD, LODASH] } },
        externalImports: {
            "/root/src/app.ts": [
                { ecosystem: "npm", name: "express" },
                { ecosystem: "npm", name: "lodash" }
            ],
            "/root/src/server/routes.ts": [{ ecosystem: "npm", name: "express" }]
        },
        ...overrides
    }
}
