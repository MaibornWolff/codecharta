import { SecurityData, SecurityPackage } from "../../model/codeCharta.model"
import { getUpdatedPath } from "../../util/nodePathHelper"

/** The security data of one map shown beside others, its paths moved under the folder named after the map. */
export function securityUnderFileName(security: SecurityData, fileName: string): SecurityData {
    return {
        ...security,
        lockfiles: relocated(security.lockfiles, fileName),
        externalImports: relocated(security.externalImports, fileName)
    }
}

/**
 * Several maps' packages as one: a package checked in any map counts as checked, so one only an unchecked map lists
 * says itself that nobody checked it.
 */
export function mergedSecurity(all: SecurityData[]): SecurityData | undefined {
    if (all.length <= 1) {
        return all[0]
    }
    const isAnyMeasured = all.some(security => security.vulnerabilitiesMeasured)
    const merged: SecurityData = {
        vulnerabilitiesMeasured: isAnyMeasured,
        vulnerabilitySources: [...new Set(all.flatMap(security => security.vulnerabilitySources))],
        packages: {},
        lockfiles: {},
        externalImports: {}
    }
    for (const security of all) {
        const isUnchecked = isAnyMeasured && !security.vulnerabilitiesMeasured
        for (const [key, securityPackage] of Object.entries(security.packages)) {
            merged.packages[key] = mergedPackage(
                merged.packages[key],
                isUnchecked ? { ...securityPackage, vulnerabilitiesUnknown: true } : securityPackage
            )
        }
        Object.assign(merged.lockfiles, security.lockfiles)
        Object.assign(merged.externalImports, security.externalImports)
        merged.versionsLookup = latestLookup(merged.versionsLookup, security.versionsLookup)
    }
    return merged
}

function mergedPackage(existing: SecurityPackage | undefined, incoming: SecurityPackage): SecurityPackage {
    if (!existing) {
        return incoming
    }
    const withVersions = existing.newestVersion === undefined ? incoming : existing
    const vulnerabilities = [...(existing.vulnerabilities ?? []), ...(incoming.vulnerabilities ?? [])]
    return {
        ...withVersions,
        vulnerabilities: vulnerabilities.filter(
            (vulnerability, index) => vulnerabilities.findIndex(({ id }) => id === vulnerability.id) === index
        ),
        vulnerabilitiesUnknown: existing.vulnerabilitiesUnknown && incoming.vulnerabilitiesUnknown ? true : undefined
    }
}

function latestLookup(first: SecurityData["versionsLookup"], second: SecurityData["versionsLookup"]): SecurityData["versionsLookup"] {
    if (!first || !second) {
        return first ?? second
    }
    return second.date > first.date ? second : first
}

function relocated<Entry>(byPath: Record<string, Entry>, fileName: string): Record<string, Entry> {
    return Object.fromEntries(Object.entries(byPath).map(([path, entry]) => [getUpdatedPath(fileName, path), entry]))
}
