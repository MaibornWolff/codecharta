import { Injectable, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { hasTfidfDataSelector } from "../../../lenses/domain/domainLens.facade"
import { CcState } from "../../../model/codeCharta.model"
import { defaultWordCloudSettings } from "../../../model/wordCloud.model"
import { DomainStateReadWindow } from "../../../stores/domainState/domainState.read.facade"

@Injectable({ providedIn: "root" })
export class DomainBarReadStore {
    private readonly domainStateReadWindow = inject(DomainStateReadWindow)
    private readonly store: Store<CcState> = inject(Store)

    readonly settings = toSignal(this.domainStateReadWindow.wordCloudSettings$, { initialValue: defaultWordCloudSettings })
    readonly hasTfidfData = toSignal(this.store.select(hasTfidfDataSelector), { initialValue: false })
}
