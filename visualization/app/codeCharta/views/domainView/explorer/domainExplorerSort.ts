import { Injectable, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { ExplorerSort } from "../../../features/sidebarExplorer/facade"
import { SortingOption } from "../../../model/codeCharta.model"
import {
    domainStateSortingOrderAscendingSelector,
    domainStateSortingOrderSelector
} from "../../../stores/domainState/domainState.read.facade"
import { setDomainStateSortingOrder, setDomainStateSortingOrderAscending } from "../../../stores/domainState/domainState.write.facade"

@Injectable()
export class DomainExplorerSort implements ExplorerSort {
    private readonly store = inject(Store)

    readonly option$ = this.store.select(domainStateSortingOrderSelector)
    readonly ascending$ = this.store.select(domainStateSortingOrderAscendingSelector)

    private readonly ascending = toSignal(this.ascending$, { requireSync: true })

    setOption(option: SortingOption): void {
        this.store.dispatch(setDomainStateSortingOrder({ value: option }))
    }

    toggleAscending(): void {
        this.store.dispatch(setDomainStateSortingOrderAscending({ value: !this.ascending() }))
    }
}
