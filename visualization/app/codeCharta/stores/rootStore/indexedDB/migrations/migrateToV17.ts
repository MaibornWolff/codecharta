import { defaultDomainLensSource } from "../../../domainLensSource/domainLensSource.read.facade"
import { seedRootIfAbsent } from "./seedDefaults"

export function migrateCcStateRecordToV17<T>(state: T): T {
    return seedRootIfAbsent(state, "domainLensSource", defaultDomainLensSource)
}
