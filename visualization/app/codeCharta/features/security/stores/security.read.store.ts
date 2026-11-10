import { Injectable, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { packageRowsSelector, securitySummarySelector } from "../../../lenses/security/security.facade"

@Injectable({ providedIn: "root" })
export class SecurityReadStore {
    private readonly store = inject(Store)

    readonly rows = toSignal(this.store.select(packageRowsSelector), { requireSync: true })
    readonly summary = toSignal(this.store.select(securitySummarySelector), { requireSync: true })
}
