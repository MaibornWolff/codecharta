import { Injectable, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { hasDomainDataSelector } from "../../../lenses/domain/domainLens.facade"

@Injectable({ providedIn: "root" })
export class ViewSwitcherReadStore {
    private readonly store = inject(Store)

    readonly hasDomainData = toSignal(this.store.select(hasDomainDataSelector), { initialValue: false })
}
