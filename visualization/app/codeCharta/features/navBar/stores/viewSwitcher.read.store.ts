import { Injectable, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { hasDomainDataSelector } from "../../../lenses/domain/domainLens.facade"
import { isDependencyViewAvailableSelector } from "../selectors/isDependencyViewAvailable.selector"

@Injectable({ providedIn: "root" })
export class ViewSwitcherReadStore {
    private readonly store = inject(Store)

    /** Stays available in compare mode: picking the domain view leaves compare rather than being
     * blocked by it (see RedirectAwayFromDomainViewEffect). */
    readonly isDomainViewAvailable = toSignal(this.store.select(hasDomainDataSelector), { initialValue: false })

    readonly isDependencyViewAvailable = toSignal(this.store.select(isDependencyViewAvailableSelector), { initialValue: false })
}
