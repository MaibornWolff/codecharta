import { Injectable, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { hasTfidfDataSelector } from "../../../lenses/domain/domainLens.facade"
import { defaultWordCloudSettings } from "../../../model/wordCloud.model"
import { DomainBarReadWindow } from "../../../stores/domainBar/domainBar.read.facade"

/**
 * Read surface of the domain settings bar: the persisted word-cloud controls as signals, plus whether
 * the loaded data carries tfidf (which gates the tfidf sizing option).
 */
@Injectable({ providedIn: "root" })
export class DomainBarReadStore {
    private readonly domainBarReadWindow = inject(DomainBarReadWindow)
    private readonly store = inject(Store)

    readonly settings = toSignal(this.domainBarReadWindow.wordCloudSettings$, { initialValue: defaultWordCloudSettings })
    readonly hasTfidfData = toSignal(this.store.select(hasTfidfDataSelector), { initialValue: false })
}
