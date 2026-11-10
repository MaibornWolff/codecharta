import {
    AttributeDescriptors,
    AttributeTypeMap,
    AttributeTypeValue,
    KeyValuePair,
    SecurityData,
    SecurityPackage,
    Severity
} from "../../model/codeCharta.model"
import { packagesReachedByFile } from "./packageReach"

export const SECURITY_METRICS = {
    packages: "packages",
    vulnerablePackages: "vulnerable_packages",
    worstSeverity: "worst_severity",
    meanDaysOutdated: "mean_days_outdated",
    outdatedPackages: "outdated_packages"
} as const

const SEVERITY_RANK: Record<Severity, number> = { critical: 4, high: 3, medium: 2, low: 1, unknown: 1 }
const LOWER_IS_BETTER = -1

export function isVulnerable(securityPackage: SecurityPackage): boolean {
    return (securityPackage.vulnerabilities?.length ?? 0) > 0
}

export function isOutdated(securityPackage: SecurityPackage): boolean {
    return (securityPackage.newerVersions ?? 0) > 0
}

function worstSeverityRank(securityPackage: SecurityPackage): number {
    return Math.max(0, ...(securityPackage.vulnerabilities ?? []).map(vulnerability => SEVERITY_RANK[vulnerability.severity]))
}

/** The values a file shows on the map: for a lockfile over the packages it declares, for a code file over those it reaches. */
function securityFigures(security: SecurityData, keys: Iterable<string>): KeyValuePair {
    const packages = [...keys].map(key => security.packages[key]).filter(Boolean)
    const figures: KeyValuePair = { [SECURITY_METRICS.packages]: packages.length }
    const checked = security.vulnerabilitiesMeasured ? packages.filter(securityPackage => !securityPackage.vulnerabilitiesUnknown) : []
    if (checked.length > 0) {
        figures[SECURITY_METRICS.vulnerablePackages] = checked.filter(isVulnerable).length
        figures[SECURITY_METRICS.worstSeverity] = Math.max(...checked.map(worstSeverityRank))
    }
    const looked = packages.filter(securityPackage => securityPackage.daysOutdated !== undefined)
    if (looked.length > 0) {
        figures[SECURITY_METRICS.meanDaysOutdated] = Math.round(
            looked.reduce((sum, { daysOutdated }) => sum + daysOutdated, 0) / looked.length
        )
        figures[SECURITY_METRICS.outdatedPackages] = looked.filter(isOutdated).length
    }
    return figures
}

/** The values of every lockfile and every code file that imports a package, keyed by path. */
export function securityFiguresByPath(security: SecurityData): Record<string, KeyValuePair> {
    const byPath: Record<string, KeyValuePair> = {}
    for (const [path, reached] of Object.entries(packagesReachedByFile(security))) {
        byPath[path] = securityFigures(security, reached)
    }
    for (const [path, lockfile] of Object.entries(security.lockfiles)) {
        byPath[path] = securityFigures(security, lockfile.declares)
    }
    return byPath
}

export const SECURITY_ATTRIBUTE_TYPES: AttributeTypeMap = {
    [SECURITY_METRICS.packages]: AttributeTypeValue.absolute,
    [SECURITY_METRICS.vulnerablePackages]: AttributeTypeValue.absolute,
    [SECURITY_METRICS.worstSeverity]: AttributeTypeValue.relative,
    [SECURITY_METRICS.meanDaysOutdated]: AttributeTypeValue.relative,
    [SECURITY_METRICS.outdatedPackages]: AttributeTypeValue.absolute
}

export const SECURITY_ATTRIBUTE_DESCRIPTORS: AttributeDescriptors = {
    [SECURITY_METRICS.packages]: descriptor(
        "Third-party packages",
        "Packages a lockfile declares, or a code file imports together with everything they pull in"
    ),
    [SECURITY_METRICS.vulnerablePackages]: descriptor(
        "Vulnerable packages",
        "Of those packages, the ones with at least one known vulnerability"
    ),
    [SECURITY_METRICS.worstSeverity]: descriptor(
        "Worst vulnerability severity",
        "Highest severity among those packages: 4 critical, 3 high, 2 medium, 1 low or unknown, 0 none"
    ),
    [SECURITY_METRICS.meanDaysOutdated]: descriptor(
        "Mean days outdated",
        "Mean days since a newer stable version of those packages was released, 0 for an up-to-date package"
    ),
    [SECURITY_METRICS.outdatedPackages]: descriptor("Outdated packages", "Of those packages, the ones with a newer stable version")
}

function descriptor(title: string, description: string) {
    return {
        title,
        description,
        hintLowValue: "",
        hintHighValue: "",
        link: "https://codecharta.com/docs/importer/sbom",
        direction: LOWER_IS_BETTER
    }
}
