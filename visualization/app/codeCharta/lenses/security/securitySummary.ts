import { SecurityData } from "../../model/codeCharta.model"
import { isOutdated, isVulnerable } from "../../util/security/securityFigures"

export interface SecuritySummary {
    packages: number
    /** Null when no scanner or lookup checked the packages. */
    vulnerablePackages: number | null
    /** Null without a version lookup. */
    outdatedPackages: number | null
    meanDaysOutdated: number | null
    sources: string[]
    lookupDate: string | null
}

export function securitySummaryOf(security: SecurityData): SecuritySummary {
    const packages = Object.values(security.packages)
    const looked = packages.filter(securityPackage => securityPackage.daysOutdated !== undefined)
    const checked = packages.filter(securityPackage => !securityPackage.vulnerabilitiesUnknown)
    return {
        packages: packages.length,
        vulnerablePackages: security.vulnerabilitiesMeasured ? checked.filter(isVulnerable).length : null,
        outdatedPackages: looked.length > 0 ? looked.filter(isOutdated).length : null,
        meanDaysOutdated:
            looked.length > 0 ? Math.round(looked.reduce((sum, { daysOutdated }) => sum + daysOutdated, 0) / looked.length) : null,
        sources: security.vulnerabilitySources,
        lookupDate: security.versionsLookup?.date ?? null
    }
}
