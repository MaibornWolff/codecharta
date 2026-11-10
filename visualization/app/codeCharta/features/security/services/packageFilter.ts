import { PackageRow } from "../../../lenses/security/security.facade"

export interface PackageFilter {
    text: string
    onlyProblems: boolean
    /** A file or folder whose packages alone are listed. */
    scopePath: string | null
}

export function filteredRows(rows: PackageRow[], { text, onlyProblems, scopePath }: PackageFilter): PackageRow[] {
    const needle = text.trim().toLowerCase()
    return rows.filter(
        row =>
            (needle === "" || row.name.toLowerCase().includes(needle) || row.key.toLowerCase().includes(needle)) &&
            (!onlyProblems || hasProblem(row)) &&
            (scopePath === null || isUsedIn(row, scopePath))
    )
}

function hasProblem(row: PackageRow): boolean {
    return row.vulnerabilities.length > 0 || (row.newerVersions ?? 0) > 0
}

function isUsedIn(row: PackageRow, scopePath: string): boolean {
    return [...row.lockfiles, ...row.importingFiles].some(path => path === scopePath || path.startsWith(`${scopePath}/`))
}
