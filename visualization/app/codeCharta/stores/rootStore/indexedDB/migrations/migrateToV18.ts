import { defaultDomainState } from "../../../domainState/domainState.read.facade"
import { seedRootIfAbsent } from "./seedDefaults"

export function migrateCcStateRecordToV18<T>(state: T): T {
    return seedRootIfAbsent(state, "domainState", defaultDomainState)
}
