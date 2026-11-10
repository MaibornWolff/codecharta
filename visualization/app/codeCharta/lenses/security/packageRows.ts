import { SecurityData, SecurityVulnerability, Severity } from "../../model/codeCharta.model"
import { packagesReachedByFile } from "../../util/security/packageReach"

export interface PackageRow {
    key: string
    name: string
    version: string
    ecosystem: string
    newestVersion?: string
    newerVersions?: number
    daysOutdated?: number
    libyears?: number
    vulnerabilities: SecurityVulnerability[]
    worstSeverity: Severity | null
    /** No scanner or lookup checked the package for vulnerabilities. */
    isUnchecked: boolean
    /** A lockfile names it itself rather than pulling it in through another package. */
    isDirect: boolean
    lockfiles: string[]
    importingFiles: string[]
}

const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "low", "unknown"]

/** One row per package, the most severe and the longest outdated first. */
export function packageRowsOf(security: SecurityData): PackageRow[] {
    const importersByKey = importersByPackage(security)
    return Object.entries(security.packages)
        .map(([key, securityPackage]): PackageRow => {
            const vulnerabilities = [...(securityPackage.vulnerabilities ?? [])].sort(bySeverity)
            return {
                key,
                name: securityPackage.name,
                version: securityPackage.version ?? "",
                ecosystem: securityPackage.ecosystem ?? "",
                newestVersion: securityPackage.newestVersion,
                newerVersions: securityPackage.newerVersions,
                daysOutdated: securityPackage.daysOutdated,
                libyears: securityPackage.libyears,
                vulnerabilities,
                worstSeverity: vulnerabilities[0]?.severity ?? null,
                isUnchecked: !security.vulnerabilitiesMeasured || securityPackage.vulnerabilitiesUnknown === true,
                isDirect: Object.values(security.lockfiles).some(lockfile => lockfile.dependsOn.includes(key)),
                lockfiles: Object.keys(security.lockfiles).filter(path => security.lockfiles[path].declares.includes(key)),
                importingFiles: importersByKey.get(key) ?? []
            }
        })
        .sort(byRisk)
}

function severityRank(severity: Severity | null): number {
    return severity === null ? SEVERITY_ORDER.length : SEVERITY_ORDER.indexOf(severity)
}

function bySeverity(first: SecurityVulnerability, second: SecurityVulnerability): number {
    return severityRank(first.severity) - severityRank(second.severity) || first.id.localeCompare(second.id)
}

function byRisk(first: PackageRow, second: PackageRow): number {
    return (
        severityRank(first.worstSeverity) - severityRank(second.worstSeverity) ||
        (second.daysOutdated ?? -1) - (first.daysOutdated ?? -1) ||
        first.name.localeCompare(second.name) ||
        first.version.localeCompare(second.version)
    )
}

function importersByPackage(security: SecurityData): Map<string, string[]> {
    const importers = new Map<string, string[]>()
    for (const [path, reached] of Object.entries(packagesReachedByFile(security))) {
        for (const key of reached) {
            importers.set(key, [...(importers.get(key) ?? []), path])
        }
    }
    return importers
}
