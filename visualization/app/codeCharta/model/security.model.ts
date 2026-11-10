export type Severity = "critical" | "high" | "medium" | "low" | "unknown"

export interface SecurityVulnerability {
    id: string
    severity: Severity
    score?: number
    fixedVersions?: string[]
    source?: string
}

/** A field the analysis did not measure is absent, never zero. */
export interface SecurityPackage {
    name: string
    version?: string
    ecosystem?: string
    dependsOn?: string[]
    newestVersion?: string
    newerVersions?: number
    daysOutdated?: number
    libyears?: number
    vulnerabilities?: SecurityVulnerability[]
    vulnerabilitiesUnknown?: boolean
}

interface SecurityLockfile {
    declares: string[]
    dependsOn: string[]
}

export interface ExternalImport {
    ecosystem: string
    name: string
}

export interface SecurityData {
    vulnerabilitiesMeasured: boolean
    vulnerabilitySources: string[]
    versionsLookup?: { source: string; date: string }
    /** Keyed by purl. */
    packages: Record<string, SecurityPackage>
    /** Keyed by the path of the lockfile. */
    lockfiles: Record<string, SecurityLockfile>
    /** Keyed by the path of the code file that imports them. */
    externalImports: Record<string, ExternalImport[]>
}
