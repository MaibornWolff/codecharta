import { Injectable } from "@angular/core"
import { AmountOfEdgePreviewsStore } from "../stores/amountOfEdgePreviews.store"

@Injectable({
    providedIn: "root"
})
export class AmountOfEdgePreviewsService {
    constructor(private readonly amountOfEdgePreviewsStore: AmountOfEdgePreviewsStore) {}

    amountOfEdgePreviews$() {
        return this.amountOfEdgePreviewsStore.amountOfEdgePreviews$
    }

    setAmountOfEdgePreviews(value: number) {
        this.amountOfEdgePreviewsStore.setAmountOfEdgePreviews(value)
    }
}
